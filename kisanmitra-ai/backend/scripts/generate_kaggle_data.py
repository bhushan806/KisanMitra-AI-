import os
import sys
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

from database import get_sync_collection

np.random.seed(42)

COMMODITIES = [
    "onion",
    "potato",
    "tomato",
    "garlic",
    "cauliflower",
    "green_chilli",
    "brinjal",
    "cabbage",
]

# Realistic base prices and volatility for Kaggle emulation
COMMODITY_PROPS = {
    "onion": {"base": 2500, "volatility": 300, "season_amp": 1000},
    "potato": {"base": 1800, "volatility": 150, "season_amp": 500},
    "tomato": {"base": 3000, "volatility": 500, "season_amp": 1500},
    "garlic": {"base": 6000, "volatility": 400, "season_amp": 800},
    "cauliflower": {"base": 2000, "volatility": 200, "season_amp": 600},
    "green_chilli": {"base": 4000, "volatility": 600, "season_amp": 1200},
    "brinjal": {"base": 2200, "volatility": 250, "season_amp": 700},
    "cabbage": {"base": 1500, "volatility": 150, "season_amp": 400},
}


def generate_data():
    db_market_prices = get_sync_collection("market_prices")
    db_market_prices.delete_many({"data_type": "kaggle_generated"})

    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=365 * 2)  # 2 years of data

    dates = pd.date_range(start=start_date, end=end_date, freq="D")

    records = []

    for commodity in COMMODITIES:
        props = COMMODITY_PROPS[commodity]

        # Time-series generation with trend, seasonality, and noise
        time = np.arange(len(dates))
        trend = time * 0.5
        seasonality = np.sin(2 * np.pi * time / 365) * props["season_amp"]
        noise = np.random.normal(0, props["volatility"], len(dates))

        prices = props["base"] + trend + seasonality + noise
        prices = np.maximum(prices, 100)  # Floor price

        for i, dt in enumerate(dates):
            record = {
                "State": "Maharashtra",  # Emulating Kaggle schema
                "District": "Pune",
                "Market": "Pune",
                "commodity": commodity,
                "Variety": "Local",
                "Grade": "FAQ",
                "Min_Price": round(prices[i] * 0.8, 2),
                "Max_Price": round(prices[i] * 1.2, 2),
                "price": round(prices[i], 2),  # Modal price acts as target price
                "date": dt.strftime("%Y-%m-%d"),
                "data_type": "kaggle_generated",
            }
            records.append(record)

    if records:
        db_market_prices.insert_many(records)
        print(
            f"Successfully generated and inserted {len(records)} records into MongoDB."
        )
    else:
        print("Failed to generate records.")


if __name__ == "__main__":
    generate_data()
