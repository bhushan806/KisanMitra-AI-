import nbformat as nbf
import os

def create_notebook(filename, cells):
    nb = nbf.v4.new_notebook()
    nb_cells = []
    for cell_type, content in cells:
        if cell_type == 'markdown':
            nb_cells.append(nbf.v4.new_markdown_cell(content))
        elif cell_type == 'code':
            nb_cells.append(nbf.v4.new_code_cell(content))
    nb['cells'] = nb_cells
    with open(f"../ml_notebooks/{filename}", 'w', encoding='utf-8') as f:
        nbf.write(nb, f)

# Notebook 01: Data Exploration
nb1_cells = [
    ('markdown', '# 01. Data Exploration & Synthetic Data Generation\n\nIn this notebook, we explore the historical price data for Onion, Potato, and Tomato. Since real API limits may apply, we generate a robust synthetic dataset mimicking real Indian agriculture markets.'),
    ('code', 'import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nfrom datetime import datetime, timedelta\nimport os\n\n# Set random seed for reproducibility\nnp.random.seed(42)\n\n# Create directory for data\nos.makedirs("../backend/data/raw", exist_ok=True)'),
    ('markdown', '## Generating Synthetic Data\nWe generate 3 years of daily prices with seasonal patterns and festival spikes.'),
    ('code', '''def generate_synthetic_prices(commodity, base_price, volatility, start_date="2021-01-01", days=1095):
    dates = [pd.to_datetime(start_date) + timedelta(days=i) for i in range(days)]
    
    # Base trend
    prices = [base_price]
    
    for i in range(1, days):
        # Add random walk with some mean reversion to base price
        change = np.random.normal(0, volatility)
        
        # Seasonality: Monsoon (Jul-Sep) causes spikes, Winter (Dec-Feb) causes drops
        month = dates[i].month
        if month in [7, 8, 9]:
            seasonality = base_price * 0.005 # Upward pressure
        elif month in [12, 1, 2]:
            seasonality = -base_price * 0.003 # Downward pressure
        else:
            seasonality = 0
            
        # Festival spikes (Oct-Nov Diwali)
        if month in [10, 11] and 15 <= dates[i].day <= 25:
            seasonality = base_price * 0.02
            
        new_price = prices[-1] * 0.98 + base_price * 0.02 + change + seasonality
        prices.append(max(base_price * 0.4, new_price)) # Prevent going too low
        
    df = pd.DataFrame({"date": dates, "price": prices})
    df["commodity"] = commodity
    return df

df_onion = generate_synthetic_prices("onion", 1500, 50)
df_potato = generate_synthetic_prices("potato", 900, 30)
df_tomato = generate_synthetic_prices("tomato", 2000, 80)

df_all = pd.concat([df_onion, df_potato, df_tomato])
df_all.to_csv("../backend/data/raw/synthetic_prices.csv", index=False)
print("Synthetic data generated with shape:", df_all.shape)'''),
    ('markdown', '## Visualizing the Data'),
    ('code', '''plt.figure(figsize=(15, 6))
for commodity in ["onion", "potato", "tomato"]:
    data = df_all[df_all["commodity"] == commodity]
    plt.plot(data["date"], data["price"], label=commodity.capitalize())
plt.title("Synthetic Agricultural Prices (3 Years)")
plt.xlabel("Date")
plt.ylabel("Price (₹/quintal)")
plt.legend()
plt.savefig("01_data_exploration.png")
plt.show()''')
]

# Notebook 02: Feature Engineering
nb2_cells = [
    ('markdown', '# 02. Feature Engineering\n\nWe calculate rolling features, lags, and weather proxies (NDVI).'),
    ('code', '''import pandas as pd
import numpy as np

df = pd.read_csv("../backend/data/raw/synthetic_prices.csv")
df["date"] = pd.to_datetime(df["date"])
df = df.sort_values(by=["commodity", "date"])

# Create lags and rolling features
def create_features(group):
    group["price_lag_7"] = group["price"].shift(7)
    group["price_lag_14"] = group["price"].shift(14)
    group["price_lag_30"] = group["price"].shift(30)
    group["rolling_mean_7"] = group["price"].rolling(window=7).mean()
    group["rolling_mean_30"] = group["price"].rolling(window=30).mean()
    group["rolling_std_7"] = group["price"].rolling(window=7).std()
    
    # Calendar features
    group["day_of_week"] = group["date"].dt.dayofweek
    group["month"] = group["date"].dt.month
    
    # Fake Weather Features
    group["temperature"] = 25 + 10 * np.sin(group["date"].dt.dayofyear / 365.0 * 2 * np.pi) + np.random.normal(0, 2, len(group))
    group["rainfall"] = np.where(group["month"].isin([6,7,8,9]), np.random.gamma(2, 5, len(group)), np.random.exponential(1, len(group)))
    
    # NDVI proxy (1 - (30 - rainfall_30d)/30)
    group["rainfall_30d"] = group["rainfall"].rolling(window=30).mean().fillna(0)
    group["ndvi_proxy"] = np.clip(1 - (30 - group["rainfall_30d"]) / 30, 0, 1)
    
    return group

df_features = df.groupby("commodity", group_keys=False).apply(create_features).dropna()
import os
os.makedirs("../backend/data/processed", exist_ok=True)
df_features.to_csv("../backend/data/processed/engineered_features.csv", index=False)
print("Features created. Shape:", df_features.shape)
df_features.head()''')
]

# Notebook 03: SARIMA Training
nb3_cells = [
    ('markdown', '# 03. SARIMA Training\n\nTraining SARIMA models for Onion, Potato, and Tomato using statsmodels.'),
    ('code', '''import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.tsa.statespace.sarimax import SARIMAX
import joblib
import os
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error

df = pd.read_csv("../backend/data/processed/engineered_features.csv")
df["date"] = pd.to_datetime(df["date"])

os.makedirs("../backend/models/saved", exist_ok=True)

def train_sarima(commodity):
    data = df[df["commodity"] == commodity].set_index("date")["price"]
    train, test = data.iloc[:-30], data.iloc[-30:]
    
    print(f"Training SARIMA for {commodity}...")
    # Using simplified order for faster execution in MVP
    model = SARIMAX(train, order=(1, 1, 1), seasonal_order=(1, 1, 0, 12))
    result = model.fit(disp=False)
    
    # Forecast
    forecast = result.get_forecast(steps=30)
    pred = forecast.predicted_mean
    
    mae = mean_absolute_error(test, pred)
    mape = mean_absolute_percentage_error(test, pred)
    print(f"{commodity} SARIMA - MAE: {mae:.2f}, MAPE: {mape:.4f}")
    
    # Save model
    joblib.dump(result, f"../backend/models/saved/sarima_{commodity}.pkl")
    
    # Plot
    plt.figure(figsize=(10, 4))
    plt.plot(train.index[-60:], train.iloc[-60:], label="Train")
    plt.plot(test.index, test, label="Actual")
    plt.plot(test.index, pred, label="Forecast")
    plt.fill_between(test.index, forecast.conf_int().iloc[:, 0], forecast.conf_int().iloc[:, 1], color='k', alpha=.15)
    plt.title(f"SARIMA Forecast - {commodity.capitalize()}")
    plt.legend()
    plt.savefig(f"03_sarima_{commodity}.png")
    plt.close()

for c in ["onion", "potato", "tomato"]:
    train_sarima(c)''')
]

# Notebook 04: XGBoost Training
nb4_cells = [
    ('markdown', '# 04. XGBoost Training\n\nTraining XGBoost Regressor using all engineered features.'),
    ('code', '''import pandas as pd
import xgboost as xgb
import joblib
import os
import matplotlib.pyplot as plt
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error

df = pd.read_csv("../backend/data/processed/engineered_features.csv")
df["date"] = pd.to_datetime(df["date"])

features = ["price_lag_7", "price_lag_14", "price_lag_30", "rolling_mean_7", "rolling_mean_30", "rolling_std_7", "day_of_week", "month", "temperature", "rainfall", "ndvi_proxy"]

def train_xgboost(commodity):
    data = df[df["commodity"] == commodity].sort_values("date")
    X = data[features]
    y = data["price"]
    
    split = int(len(data) * 0.8)
    X_train, X_test = X.iloc[:split], X.iloc[split:]
    y_train, y_test = y.iloc[:split], y.iloc[split:]
    
    model = xgb.XGBRegressor(n_estimators=500, learning_rate=0.05, max_depth=6, subsample=0.8, colsample_bytree=0.8)
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], early_stopping_rounds=50, verbose=False)
    
    pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, pred)
    mape = mean_absolute_percentage_error(y_test, pred)
    print(f"{commodity} XGBoost - MAE: {mae:.2f}, MAPE: {mape:.4f}")
    
    joblib.dump(model, f"../backend/models/saved/xgboost_{commodity}.pkl")
    
    # Feature Importance
    plt.figure(figsize=(10, 5))
    importances = pd.Series(model.feature_importances_, index=features).sort_values(ascending=False)
    importances.plot(kind='bar')
    plt.title(f"XGBoost Feature Importance - {commodity.capitalize()}")
    plt.tight_layout()
    plt.savefig(f"04_xgboost_{commodity}_feat_imp.png")
    plt.close()

for c in ["onion", "potato", "tomato"]:
    train_xgboost(c)''')
]

# Notebook 05: LSTM Training
nb5_cells = [
    ('markdown', '# 05. LSTM Training\n\nTraining LSTM neural networks using Keras. We use a 30-day lookback window.'),
    ('code', '''import pandas as pd
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.preprocessing import MinMaxScaler
import joblib
import os

df = pd.read_csv("../backend/data/processed/engineered_features.csv")
df["date"] = pd.to_datetime(df["date"])

def create_sequences(data, seq_length=30):
    xs, ys = [], []
    for i in range(len(data)-seq_length):
        xs.append(data[i:(i+seq_length)])
        ys.append(data[i+seq_length])
    return np.array(xs), np.array(ys)

def train_lstm(commodity):
    print(f"Training LSTM for {commodity}...")
    data = df[df["commodity"] == commodity].sort_values("date")["price"].values.reshape(-1, 1)
    
    scaler = MinMaxScaler()
    data_scaled = scaler.fit_transform(data)
    joblib.dump(scaler, f"../backend/models/saved/scaler_{commodity}.pkl")
    
    X, y = create_sequences(data_scaled)
    split = int(len(X) * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]
    
    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=(30, 1)),
        Dropout(0.2),
        LSTM(32),
        Dropout(0.2),
        Dense(16, activation='relu'),
        Dense(1)
    ])
    
    model.compile(optimizer='adam', loss='huber')
    es = EarlyStopping(patience=10, restore_best_weights=True)
    
    model.fit(X_train, y_train, epochs=20, batch_size=32, validation_data=(X_test, y_test), callbacks=[es], verbose=0)
    
    model.save(f"../backend/models/saved/lstm_{commodity}.h5")
    print(f"LSTM saved for {commodity}.")

for c in ["onion", "potato", "tomato"]:
    train_lstm(c)''')
]

# Notebook 06: Ensemble Evaluation
nb6_cells = [
    ('markdown', '# 06. Ensemble Evaluation\n\nComparing individual models against the Ensemble approach (20% SARIMA, 50% XGBoost, 30% LSTM).'),
    ('code', '''import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model
from sklearn.metrics import mean_absolute_percentage_error

df = pd.read_csv("../backend/data/processed/engineered_features.csv")
df["date"] = pd.to_datetime(df["date"])

features = ["price_lag_7", "price_lag_14", "price_lag_30", "rolling_mean_7", "rolling_mean_30", "rolling_std_7", "day_of_week", "month", "temperature", "rainfall", "ndvi_proxy"]

def evaluate_ensemble(commodity):
    data = df[df["commodity"] == commodity].sort_values("date")
    
    # We'll evaluate on the last 30 days
    test_data = data.iloc[-30:]
    y_test = test_data["price"].values
    
    # Load models
    sarima = joblib.load(f"../backend/models/saved/sarima_{commodity}.pkl")
    xgb = joblib.load(f"../backend/models/saved/xgboost_{commodity}.pkl")
    lstm = load_model(f"../backend/models/saved/lstm_{commodity}.h5")
    scaler = joblib.load(f"../backend/models/saved/scaler_{commodity}.pkl")
    
    # SARIMA Pred
    pred_sarima = sarima.get_forecast(steps=30).predicted_mean.values
    
    # XGB Pred
    pred_xgb = xgb.predict(test_data[features])
    
    # LSTM Pred
    # We need sequences for LSTM
    data_prices = data["price"].values.reshape(-1, 1)
    data_scaled = scaler.transform(data_prices)
    
    lstm_preds = []
    # Quick sequence creation for the last 30 days
    for i in range(len(data)-30, len(data)):
        seq = data_scaled[i-30:i].reshape(1, 30, 1)
        lstm_preds.append(lstm.predict(seq, verbose=0)[0][0])
    
    pred_lstm = scaler.inverse_transform(np.array(lstm_preds).reshape(-1, 1)).flatten()
    
    # Ensemble
    pred_ensemble = (0.2 * pred_sarima) + (0.5 * pred_xgb) + (0.3 * pred_lstm)
    
    # Metrics
    mape_sarima = mean_absolute_percentage_error(y_test, pred_sarima)
    mape_xgb = mean_absolute_percentage_error(y_test, pred_xgb)
    mape_lstm = mean_absolute_percentage_error(y_test, pred_lstm)
    mape_ens = mean_absolute_percentage_error(y_test, pred_ensemble)
    
    print(f"--- {commodity.capitalize()} MAPE ---")
    print(f"SARIMA:  {mape_sarima:.4f}")
    print(f"XGBoost: {mape_xgb:.4f}")
    print(f"LSTM:    {mape_lstm:.4f}")
    print(f"Ensemble:{mape_ens:.4f}")
    
    plt.figure(figsize=(10, 5))
    plt.plot(test_data["date"], y_test, label="Actual", linewidth=2)
    plt.plot(test_data["date"], pred_ensemble, label="Ensemble", linestyle="--", linewidth=2)
    plt.title(f"{commodity.capitalize()} Ensemble Forecast vs Actual")
    plt.legend()
    plt.savefig(f"06_ensemble_{commodity}.png")
    plt.close()

for c in ["onion", "potato", "tomato"]:
    evaluate_ensemble(c)''')
]

create_notebook("01_data_exploration.ipynb", nb1_cells)
create_notebook("02_feature_engineering.ipynb", nb2_cells)
create_notebook("03_sarima_training.ipynb", nb3_cells)
create_notebook("04_xgboost_training.ipynb", nb4_cells)
create_notebook("05_lstm_training.ipynb", nb5_cells)
create_notebook("06_ensemble_evaluation.ipynb", nb6_cells)
print("Notebooks generated.")
