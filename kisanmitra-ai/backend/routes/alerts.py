from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime, timezone, timedelta
import random

router = APIRouter()

IST = timezone(timedelta(hours=5, minutes=30))

COMMODITY_BASE_PRICES = {
    "onion": 1500,
    "potato": 900,
    "tomato": 2000,
    "garlic": 8000,
    "cauliflower": 1200,
    "green_chilli": 4000,
    "brinjal": 1100,
    "cabbage": 800,
}

MANDIS = [
    "lasalgaon",
    "pune",
    "agra",
    "kanpur",
    "bangalore",
    "hubli",
    "jaipur",
    "ahmedabad",
]


@router.get("/alerts")
async def get_alerts(commodity: Optional[str] = None, level: Optional[str] = None):
    now = datetime.now(IST)
    alerts = []

    for c_id, base in COMMODITY_BASE_PRICES.items():
        seed = hash(c_id + now.strftime("%Y-%m-%d")) % 10000
        rng = random.Random(seed)
        change_pct = rng.uniform(-5, 12)

        if change_pct > 5:
            lvl = "CRITICAL" if change_pct > 10 else "HIGH"
            mandi = rng.choice(MANDIS)
            trigger_price = round(base * (1 + change_pct / 100))
            forecast_date = (now + timedelta(days=7)).strftime("%Y-%m-%d")

            alerts.append(
                {
                    "commodity": c_id,
                    "mandi": mandi,
                    "alert_level": lvl,
                    "trigger_price": trigger_price,
                    "avg_price": base,
                    "forecast_date": forecast_date,
                }
            )

    filtered = alerts
    if commodity:
        filtered = [a for a in filtered if a["commodity"] == commodity.lower()]
    if level:
        filtered = [a for a in filtered if a["alert_level"] == level.upper()]

    return {"alerts": filtered}
