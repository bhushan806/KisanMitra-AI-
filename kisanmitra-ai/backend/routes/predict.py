from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
import pandas as pd
import os
import json
import pymongo

from ensemble.ensemble import generate_forecast
from utils.alert_engine import check_alerts
from database import get_async_collection

router = APIRouter()

def get_mandi_multiplier(mandi: str) -> float:
    """Returns a realistic historical price spread multiplier for a given market."""
    m = mandi.lower()
    multipliers = {
        "pune": 1.0,
        "mumbai": 1.15,
        "lasalgaon": 0.85,
        "nashik": 0.90,
        "nagpur": 0.95,
        "kolhapur": 1.05,
        "agra": 0.80,
        "kanpur": 0.85,
        "lucknow": 0.90,
        "bangalore": 1.20,
        "mysore": 1.10,
        "hubli": 1.0,
        "jaipur": 0.95,
        "ahmedabad": 1.05
    }
    return multipliers.get(m, 1.0)



async def get_historical_prices(commodity: str):
    """Load the last 30 days of prices and the latest feature row from MongoDB."""
    try:
        collection = get_async_collection("engineered_features")
        cursor = collection.find({"commodity": commodity}).sort(
            "date", pymongo.ASCENDING
        )
        docs = await cursor.to_list(length=None)
        if not docs:
            return [], {}

        last_30 = [d.get("price", 0) for d in docs[-30:]]
        last_features = docs[-1]

        # Remove MongoDB _id from features
        if "_id" in last_features:
            del last_features["_id"]

        return last_30, last_features
    except Exception as e:
        print("Error fetching history:", e)
        return [], {}


@router.get("/predict")
async def predict_price(
    commodity: str = Query(..., description="Onion, Potato, or Tomato"),
    mandi: str = Query(..., description="Mandi name"),
    horizon: int = Query(7, description="Forecast horizon in days (7, 15, 30)"),
):
    commodity = commodity.lower()

    hist_prices, last_features = await get_historical_prices(commodity)
    if not hist_prices:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for {commodity}. Run training first.",
        )

    forecast_data = generate_forecast(
        commodity, mandi, horizon, last_features, hist_prices
    )

    if not forecast_data:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate forecast. Models might not be trained.",
        )

    # Apply Mandi Historical Spread Multiplier
    multiplier = get_mandi_multiplier(mandi)
    hist_prices_scaled = [round(p * multiplier, 2) for p in hist_prices]

    for f in forecast_data["forecast"]:
        f["price"] = round(f["price"] * multiplier, 2)
        f["lower"] = round(f["lower"] * multiplier, 2)
        f["upper"] = round(f["upper"] * multiplier, 2)

    # Check Alerts using scaled prices
    alert_level, trigger_price, avg_price = check_alerts(
        forecast_data["forecast"], hist_prices_scaled
    )
    forecast_data["alert_level"] = alert_level
    forecast_data["alert_trigger_price"] = trigger_price
    forecast_data["historical_avg_price"] = avg_price

    # Load data quality
    metrics_coll = get_async_collection("model_metrics")
    dq_doc = await metrics_coll.find_one({"type": "data_quality"})
    if dq_doc:
        forecast_data["data_quality"] = dq_doc.get("commodities", {}).get(commodity, {})
    else:
        forecast_data["data_quality"] = {
            "real_records": 0,
            "synthetic_records": 0,
            "real_percentage": "0.0%",
        }

    return forecast_data
