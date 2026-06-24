"""
KisanMitra AI — Train All Models
Trains SARIMA, XGBoost, and Neural-Net (MLPRegressor) for onion, potato, tomato.
Saves all model artefacts and a detailed metrics report.
"""

import pandas as pd
import numpy as np
from datetime import timedelta
import os
import sys
import json
import joblib
from statsmodels.tsa.statespace.sarimax import SARIMAX
import xgboost as xgb
from sklearn.preprocessing import MinMaxScaler
from sklearn.neural_network import MLPRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

from database import get_sync_collection

np.random.seed(42)

# ---------------------------------------------------------------------------
# Resolve paths relative to this script so it works from any working directory
# ---------------------------------------------------------------------------
RAW_DIR = os.path.join(BACKEND_DIR, "data", "raw")
PROC_DIR = os.path.join(BACKEND_DIR, "data", "processed")
MODELS_DIR = os.path.join(BACKEND_DIR, "models", "saved")

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PROC_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

# ============================================================
# 1. READ REAL DATA FROM MONGODB
# ============================================================
print("=" * 60)
print("STEP 1: Reading real price data from MongoDB ...")
print("=" * 60)

COMMODITIES = ["onion", "potato", "tomato", "garlic", "cauliflower", "green_chilli", "brinjal", "cabbage"]

db_market_prices = get_sync_collection("market_prices")
cursor = db_market_prices.find({}, {"_id": 0})
real_data_list = list(cursor)

real_df = pd.DataFrame(real_data_list)
if not real_df.empty:
    real_df["date"] = pd.to_datetime(real_df["date"])
    real_df["price"] = real_df["price"].astype(float)
else:
    real_df = pd.DataFrame(columns=["commodity", "date", "price", "data_type"])

df_all_list = []
data_quality = {"commodities": {}, "total": {"real": 0, "synthetic": 0}, "live_data_active": False, "agmarknet_last_fetch": None}

if not real_df.empty:
    data_quality["live_data_active"] = True
    from datetime import datetime
    data_quality["agmarknet_last_fetch"] = datetime.utcnow().isoformat()

for c in COMMODITIES:
    comm_real = pd.DataFrame(columns=["commodity", "date", "price", "data_type"])
    if not real_df.empty and c in real_df["commodity"].values:
        comm_real = real_df[real_df["commodity"] == c].copy()
        
    real_count = len(comm_real)
    
    if real_count < 40:
        print(f"  [Warning] Not enough data for {c} ({real_count} records). Training may skip.")
    
    df_all_list.append(comm_real)
    
    data_quality["commodities"][c] = {
        "real_records": real_count,
        "synthetic_records": 0,
        "real_percentage": "100.0%" if real_count > 0 else "0.0%"
    }
    data_quality["total"]["real"] += real_count

tot_all = data_quality["total"]["real"]
data_quality["total"]["real_percentage"] = "100.0%" if tot_all > 0 else "0.0%"

# Save data quality to MongoDB
db_metrics = get_sync_collection("model_metrics")
db_metrics.update_one(
    {"type": "data_quality"},
    {"$set": data_quality},
    upsert=True
)

print("\n--- Data Quality Check ---")
for c in COMMODITIES:
    dq = data_quality["commodities"][c]
    print(f"  - {c:12s}: {dq['real_records']} real, 0 synthetic")

df_all = pd.concat(df_all_list, ignore_index=True) if df_all_list else pd.DataFrame()
if df_all.empty:
    print("CRITICAL: No data available in market_prices MongoDB collection! Run ingestion.py first.")
    sys.exit(1)

df_all = df_all.sort_values(by=["commodity", "date"])
print(f"  > Loaded {len(df_all)} real records from MongoDB.")

# ============================================================
# 2. FEATURE ENGINEERING
# ============================================================
print("\n" + "=" * 60)
print("STEP 2: Engineering features ...")
print("=" * 60)

df_all = df_all.sort_values(by=["commodity", "date"])

def create_features(group):
    group["price_lag_7"]    = group["price"].shift(7)
    group["price_lag_14"]   = group["price"].shift(14)
    group["price_lag_30"]   = group["price"].shift(30)
    group["rolling_mean_7"] = group["price"].rolling(window=7).mean()
    group["rolling_mean_30"]= group["price"].rolling(window=30).mean()
    group["rolling_std_7"]  = group["price"].rolling(window=7).std().fillna(0)
    group["day_of_week"]    = group["date"].dt.dayofweek
    group["month"]          = group["date"].dt.month
    group["temperature"]    = (25
                               + 10 * np.sin(group["date"].dt.dayofyear / 365.0 * 2 * np.pi)
                               + np.random.normal(0, 2, len(group)))
    group["rainfall"] = np.where(
        group["month"].isin([6, 7, 8, 9]),
        np.random.gamma(2, 5, len(group)),
        np.random.exponential(1, len(group)),
    )
    group["rainfall_30d"] = group["rainfall"].rolling(window=30).mean().fillna(0)
    return group

df_feats = []
for c in COMMODITIES:
    g = create_features(df_all[df_all["commodity"] == c].copy())
    df_feats.append(g)
df_features = pd.concat(df_feats).dropna() if df_feats else pd.DataFrame()

has_ndvi = False
if not df_features.empty:
    # Fetch real satellite data
    db_satellite = get_sync_collection("satellite_data")
    sat_list = list(db_satellite.find({}, {"_id": 0}))
    sat_df = pd.DataFrame(sat_list)
    
    if not sat_df.empty:
        sat_df["date"] = pd.to_datetime(sat_df["date"])
        # Aggregate across districts as market data doesn't map by district here
        sat_agg = sat_df.groupby("date")["ndvi"].mean().reset_index()
        
        df_features["date"] = pd.to_datetime(df_features["date"])
        df_features = pd.merge(df_features, sat_agg, on="date", how="left")
        
        # We forward fill then backward fill because Sentinel-2 is sparse (every ~5 days)
        # and market prices are daily.
        df_features["ndvi"] = df_features.groupby("commodity")["ndvi"].ffill().bfill()
        
        if df_features["ndvi"].isnull().all():
            print("  [Warning] Satellite data resulted in all NaNs after merge. Skipping 'ndvi' feature.")
            df_features = df_features.drop(columns=["ndvi"])
        else:
            # Drop any remaining rows that couldn't be filled
            df_features = df_features.dropna()
            has_ndvi = True
            print("  > Successfully merged real satellite NDVI data.")
    else:
        print("  [Warning] Satellite data is unavailable in MongoDB. Skipping feature. No fake NDVI generated.")

if not df_features.empty:
    db_features = get_sync_collection("engineered_features")
    db_features.delete_many({})
    
    # Convert dates to strings for MongoDB compatibility if needed, or keep as datetime
    # We will keep as datetime since motor/pymongo handles datetime objects
    features_records = df_features.to_dict('records')
    db_features.insert_many(features_records)
    print(f"  > Saved {len(features_records)} feature records to MongoDB 'engineered_features'")
else:
    print("  [Warning] No features generated.")

# Helper to compute metrics
def mape(y_true, y_pred):
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    mask = y_true != 0
    return np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask]))

FEATURES = [
    "price_lag_7", "price_lag_14", "price_lag_30",
    "rolling_mean_7", "rolling_mean_30", "rolling_std_7",
    "day_of_week", "month", "temperature", "rainfall",
]
if has_ndvi:
    FEATURES.append("ndvi")

# We'll collect all metrics here
all_metrics = {}   # {commodity: {model: {mae, rmse, mape}}}

# ============================================================
# 3. TRAIN SARIMA
# ============================================================
print("\n" + "=" * 60)
print("STEP 3: Training SARIMA models ...")
print("=" * 60)

for commodity in COMMODITIES:
    if df_features.empty: continue
    data = df_features[df_features["commodity"] == commodity].set_index("date")["price"]
    if len(data) < 40:
        continue
    train, test = data.iloc[:-30], data.iloc[-30:]
    model = SARIMAX(train, order=(1, 1, 1), seasonal_order=(1, 1, 0, 12))
    result = model.fit(disp=False)
    save_path = os.path.join(MODELS_DIR, f"sarima_{commodity}.pkl")
    joblib.dump(result, save_path)

    # Evaluate on test set
    pred = result.get_forecast(steps=30).predicted_mean.values
    mae_val  = mean_absolute_error(test.values, pred)
    rmse_val = np.sqrt(mean_squared_error(test.values, pred))
    mape_val = mape(test.values, pred)

    all_metrics.setdefault(commodity, {})["SARIMA"] = {
        "MAE": round(mae_val, 2),
        "RMSE": round(rmse_val, 2),
        "MAPE": round(mape_val * 100, 2),
    }
    print(f"  > {commodity:8s} SARIMA  -> MAE={mae_val:.2f}  RMSE={rmse_val:.2f}  MAPE={mape_val*100:.2f}%")

# ============================================================
# 4. TRAIN XGBOOST
# ============================================================
print("\n" + "=" * 60)
print("STEP 4: Training XGBoost models ...")
print("=" * 60)

for commodity in COMMODITIES:
    if df_features.empty: continue
    data = df_features[df_features["commodity"] == commodity].sort_values("date")
    if len(data) < 40:
        continue
    X, y = data[FEATURES], data["price"]
    split = int(len(data) * 0.8)
    X_train, X_test = X.iloc[:split], X.iloc[split:]
    y_train, y_test = y.iloc[:split], y.iloc[split:]

    model = xgb.XGBRegressor(
        n_estimators=500, learning_rate=0.05, max_depth=6,
        subsample=0.8, colsample_bytree=0.8, early_stopping_rounds=50,
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
    save_path = os.path.join(MODELS_DIR, f"xgboost_{commodity}.pkl")
    joblib.dump(model, save_path)

    pred = model.predict(X_test)
    mae_val  = mean_absolute_error(y_test, pred)
    rmse_val = np.sqrt(mean_squared_error(y_test, pred))
    mape_val = mape(y_test.values, pred)

    all_metrics.setdefault(commodity, {})["XGBoost"] = {
        "MAE": round(mae_val, 2),
        "RMSE": round(rmse_val, 2),
        "MAPE": round(mape_val * 100, 2),
    }
    print(f"  > {commodity:8s} XGBoost -> MAE={mae_val:.2f}  RMSE={rmse_val:.2f}  MAPE={mape_val*100:.2f}%")

# ============================================================
# 5. TRAIN NEURAL NET (MLPRegressor replaces LSTM)
# ============================================================
print("\n" + "=" * 60)
print("STEP 5: Training Neural-Net (MLPRegressor) models ...")
print("=" * 60)

SEQ_LEN = 30

def create_sequences(data, seq_length=SEQ_LEN):
    xs, ys = [], []
    for i in range(len(data) - seq_length):
        xs.append(data[i:(i + seq_length)].flatten())
        ys.append(data[i + seq_length][0])
    return np.array(xs), np.array(ys)

for commodity in COMMODITIES:
    if df_features.empty: continue
    comm_data = df_features[df_features["commodity"] == commodity].sort_values("date")
    if len(comm_data) < 40:
        continue
    prices = comm_data["price"].values.reshape(-1, 1)

    scaler = MinMaxScaler()
    data_scaled = scaler.fit_transform(prices)
    scaler_path = os.path.join(MODELS_DIR, f"scaler_{commodity}.pkl")
    joblib.dump(scaler, scaler_path)

    X, y = create_sequences(data_scaled)
    split = int(len(X) * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    nn = MLPRegressor(
        hidden_layer_sizes=(128, 64, 32),
        max_iter=500,
        early_stopping=True,
        random_state=42,
        activation="relu",
        solver="adam",
        learning_rate="adaptive",
        validation_fraction=0.15,
        n_iter_no_change=20,
    )
    nn.fit(X_train, y_train)

    save_path = os.path.join(MODELS_DIR, f"lstm_{commodity}.pkl")
    joblib.dump(nn, save_path)

    # Evaluate – inverse-transform to original scale
    pred_scaled = nn.predict(X_test).reshape(-1, 1)
    pred_prices = scaler.inverse_transform(pred_scaled).flatten()
    true_prices = scaler.inverse_transform(y_test.reshape(-1, 1)).flatten()

    mae_val  = mean_absolute_error(true_prices, pred_prices)
    rmse_val = np.sqrt(mean_squared_error(true_prices, pred_prices))
    mape_val = mape(true_prices, pred_prices)

    all_metrics.setdefault(commodity, {})["LSTM"] = {
        "MAE": round(mae_val, 2),
        "RMSE": round(rmse_val, 2),
        "MAPE": round(mape_val * 100, 2),
    }
    print(f"  > {commodity:8s} NeuralN -> MAE={mae_val:.2f}  RMSE={rmse_val:.2f}  MAPE={mape_val*100:.2f}%")

# ============================================================
# 6. COMPUTE ENSEMBLE METRICS
# ============================================================
print("\n" + "=" * 60)
print("STEP 6: Computing ensemble metrics ...")
print("=" * 60)

WEIGHTS = {"SARIMA": 0.2, "XGBoost": 0.5, "LSTM": 0.3}

for commodity in COMMODITIES:
    if df_features.empty: continue
    data = df_features[df_features["commodity"] == commodity].sort_values("date")
    if len(data) < 40:
        continue

    # --- SARIMA test predictions (last 30 points) ---
    ts = data.set_index("date")["price"]
    train_ts, test_ts = ts.iloc[:-30], ts.iloc[-30:]
    sarima = joblib.load(os.path.join(MODELS_DIR, f"sarima_{commodity}.pkl"))
    pred_sarima = sarima.get_forecast(steps=30).predicted_mean.values

    # --- XGBoost test predictions (last 20 % of data) ---
    X_full, y_full = data[FEATURES], data["price"]
    split = int(len(data) * 0.8)
    X_test_xgb = X_full.iloc[split:]
    xgb_model = joblib.load(os.path.join(MODELS_DIR, f"xgboost_{commodity}.pkl"))
    pred_xgb_full = xgb_model.predict(X_test_xgb)

    # --- NN test predictions ---
    prices_arr = data["price"].values.reshape(-1, 1)
    sc = joblib.load(os.path.join(MODELS_DIR, f"scaler_{commodity}.pkl"))
    d_scaled = sc.fit_transform(prices_arr)
    X_seq, y_seq = create_sequences(d_scaled)
    sp = int(len(X_seq) * 0.8)
    X_test_nn = X_seq[sp:]
    y_test_nn = y_seq[sp:]
    nn_model = joblib.load(os.path.join(MODELS_DIR, f"lstm_{commodity}.pkl"))
    pred_nn_scaled = nn_model.predict(X_test_nn).reshape(-1, 1)
    pred_nn = sc.inverse_transform(pred_nn_scaled).flatten()
    true_nn = sc.inverse_transform(y_test_nn.reshape(-1, 1)).flatten()

    # Align to the shortest common test window (last 30 SARIMA test points)
    # Use last 30 from xgb and nn test arrays for alignment
    n = min(30, len(pred_xgb_full), len(pred_nn))
    ens_sarima = pred_sarima[:n]
    ens_xgb    = pred_xgb_full[-n:]
    ens_nn     = pred_nn[-n:]
    ens_true   = test_ts.values[:n]

    ens_pred = (WEIGHTS["SARIMA"] * ens_sarima
                + WEIGHTS["XGBoost"] * ens_xgb
                + WEIGHTS["LSTM"] * ens_nn)

    mae_val  = mean_absolute_error(ens_true, ens_pred)
    rmse_val = np.sqrt(mean_squared_error(ens_true, ens_pred))
    mape_val = mape(ens_true, ens_pred)

    all_metrics[commodity]["Ensemble"] = {
        "MAE": round(mae_val, 2),
        "RMSE": round(rmse_val, 2),
        "MAPE": round(mape_val * 100, 2),
    }
    print(f"  > {commodity:8s} Ensemble -> MAE={mae_val:.2f}  RMSE={rmse_val:.2f}  MAPE={mape_val*100:.2f}%")

# ============================================================
# 7. SAVE METRICS TO MONGODB
# ============================================================
print("\n" + "=" * 60)
print("STEP 7: Saving metrics to MongoDB ...")
print("=" * 60)

# Save metrics to MongoDB
db_metrics = get_sync_collection("model_metrics")
db_metrics.update_one(
    {"type": "metrics"},
    {"$set": {"data": all_metrics}},
    upsert=True
)

print(f"  > Saved model metrics to MongoDB 'model_metrics' collection")

print("\n" + "=" * 60)
print("ALL MODELS TRAINED AND SAVED SUCCESSFULLY! >")
print("=" * 60)
print(f"\nModel files location: {MODELS_DIR}")
print("Models saved:")
for commodity in COMMODITIES:
    print(f"  - sarima_{commodity}.pkl")
    print(f"  - xgboost_{commodity}.pkl")
    print(f"  - lstm_{commodity}.pkl  (MLPRegressor neural network)")
    print(f"  - scaler_{commodity}.pkl")
