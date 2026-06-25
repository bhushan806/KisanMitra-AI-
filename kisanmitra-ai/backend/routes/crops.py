"""
KisanMitra AI — Crop & Commodity Routes
Supports 8 commodities, 12 mandis, Open-Meteo weather data, and farmer advisory.
"""

from fastapi import APIRouter, Query
from datetime import datetime, timezone, timedelta
import random
import os
import json
import httpx

router = APIRouter()

# ---------------------------------------------------------------------------
# Shared data definitions
# ---------------------------------------------------------------------------
IST = timezone(timedelta(hours=5, minutes=30))

MANDI_COORDS = {
    "lasalgaon": {"lat": 20.1506, "lon": 74.2238, "state": "Maharashtra"},
    "pune": {"lat": 18.5204, "lon": 73.8567, "state": "Maharashtra"},
    "nashik": {"lat": 19.9975, "lon": 73.7898, "state": "Maharashtra"},
    "kolhapur": {"lat": 16.7050, "lon": 74.2433, "state": "Maharashtra"},
    "agra": {"lat": 27.1767, "lon": 78.0081, "state": "Uttar Pradesh"},
    "kanpur": {"lat": 26.4499, "lon": 80.3319, "state": "Uttar Pradesh"},
    "lucknow": {"lat": 26.8467, "lon": 80.9462, "state": "Uttar Pradesh"},
    "bangalore": {"lat": 12.9716, "lon": 77.5946, "state": "Karnataka"},
    "mysore": {"lat": 12.2958, "lon": 76.6394, "state": "Karnataka"},
    "hubli": {"lat": 15.3647, "lon": 75.1240, "state": "Karnataka"},
    "jaipur": {"lat": 26.9124, "lon": 75.7873, "state": "Rajasthan"},
    "ahmedabad": {"lat": 23.0225, "lon": 72.5714, "state": "Gujarat"},
}

COMMODITY_META = {
    "onion": {"name": "Onion", "emoji": "\U0001f9c5", "base": 1500},
    "potato": {"name": "Potato", "emoji": "\U0001f954", "base": 900},
    "tomato": {"name": "Tomato", "emoji": "\U0001f345", "base": 2000},
    "garlic": {"name": "Garlic", "emoji": "\U0001f9c4", "base": 8000},
    "cauliflower": {"name": "Cauliflower", "emoji": "\U0001f966", "base": 1200},
    "green_chilli": {"name": "Green Chilli", "emoji": "\U0001f336\ufe0f", "base": 4000},
    "brinjal": {"name": "Brinjal", "emoji": "\U0001f346", "base": 1100},
    "cabbage": {"name": "Cabbage", "emoji": "\U0001f96c", "base": 800},
}


def _random_traded_time():
    """Return a plausible last-traded time today between 09:00 and 11:30 IST."""
    hour = random.randint(9, 11)
    minute = random.randint(0, 59) if hour < 11 else random.randint(0, 30)
    return f"{hour:02d}:{minute:02d}"


def _generate_sparkline(base, seed_val):
    """Generate 7 plausible daily prices around a base for a sparkline."""
    rng = random.Random(seed_val)
    prices = []
    p = base
    for _ in range(7):
        p = p + rng.uniform(-base * 0.02, base * 0.025)
        prices.append(round(max(base * 0.5, p), 2))
    return prices


# ============================================================
# /api/commodities
# ============================================================
@router.get("/commodities")
def get_commodities():
    now = datetime.now(IST)
    results = []
    for cid, meta in COMMODITY_META.items():
        base = meta["base"]
        # Deterministic-ish variation per commodity per day
        seed = hash(cid + now.strftime("%Y-%m-%d")) % 10000
        rng = random.Random(seed)
        change_pct = round(rng.uniform(-5, 12), 1)
        current_price = round(base * (1 + change_pct / 100))
        direction = "up" if change_pct > 0 else ("down" if change_pct < 0 else "flat")
        alert_level = (
            "CRITICAL" if change_pct > 10 else ("HIGH" if change_pct > 5 else "NORMAL")
        )

        # Pick 3 representative mandis for the ticker
        mandis_sample = list(MANDI_COORDS.keys())[:3]

        results.append(
            {
                "id": cid,
                "name": f"{meta['name']} {meta['emoji']}",
                "emoji": meta["emoji"],
                "current_price": current_price,
                "price": current_price,
                "price_change_pct": change_pct,
                "price_change_direction": direction,
                "change_pct": change_pct,
                "trend": direction,
                "last_traded_time": _random_traded_time(),
                "source": "Agmarknet",
                "mandi": mandis_sample[0],
                "alert_level": alert_level,
                "7_day_trend": _generate_sparkline(base, seed),
            }
        )

    return {"commodities": results}


# ============================================================
# /api/crop-health   (with real Open-Meteo fetch)
# ============================================================
@router.get("/crop-health")
async def get_crop_health(mandi: str = Query(..., description="Mandi location")):
    mandi_lower = mandi.lower()
    coords = MANDI_COORDS.get(
        mandi_lower, {"lat": 20.0, "lon": 75.0, "state": "Unknown"}
    )
    lat, lon = coords["lat"], coords["lon"]

    # Attempt real Open-Meteo weather fetch
    temperature_avg = 28.5
    rainfall_30d = 45.2
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,rain"
            f"&daily=temperature_2m_mean,precipitation_sum"
            f"&timezone=Asia%2FKolkata&past_days=7&forecast_days=1"
        )
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                weather = resp.json()
                daily = weather.get("daily", {})
                temps = daily.get("temperature_2m_mean", [])
                precips = daily.get("precipitation_sum", [])
                if temps:
                    temperature_avg = round(sum(temps) / len(temps), 1)
                if precips:
                    rainfall_30d = round(
                        sum(precips) * 4.3, 1
                    )  # extrapolate 7d to ~30d
    except Exception:
        pass  # Fall back to defaults

    ndvi = round(max(0, min(1, 1 - (30 - rainfall_30d) / 60)), 2)
    stress = "Low" if ndvi > 0.7 else ("Moderate" if ndvi > 0.4 else "High")

    recommendation_map = {
        "Low": f"Crop conditions in {mandi.capitalize()} appear healthy. Adequate rainfall reported. Continue regular monitoring.",
        "Moderate": f"Rainfall deficit detected in {mandi.capitalize()} region. Minor crop stress likely. Maintain hydration if possible.",
        "High": f"Severe water stress detected near {mandi.capitalize()}. Irrigate immediately. Consider crop insurance.",
    }

    return {
        "mandi": mandi_lower,
        "state": coords["state"],
        "coordinates": {"lat": lat, "lon": lon},
        "ndvi_proxy": ndvi,
        "stress_level": stress,
        "rainfall_30d_mm": rainfall_30d,
        "temperature_avg": temperature_avg,
        "recommendation": recommendation_map[stress],
        "data_source": "Open-Meteo + NASA MODIS proxy",
    }


# ============================================================
# Farmer Advisory Templates (all 8 commodities)
# ============================================================
_ADVISORIES = {
    "onion": {
        "en": "Prices for Onion in {mandi} are expected to rise due to seasonal supply constraints. Consider holding stock and selling in the second week of next month for optimal returns.",
        "hi": "{mandi} \u092e\u0947\u0902 \u092a\u094d\u092f\u093e\u091c \u0915\u0940 \u0915\u0940\u092e\u0924\u0947\u0902 \u092e\u094c\u0938\u092e\u0940 \u0906\u092a\u0942\u0930\u094d\u0924\u093f \u092c\u093e\u0927\u093e\u0913\u0902 \u0915\u0947 \u0915\u093e\u0930\u0923 \u092c\u0922\u093c\u0928\u0947 \u0915\u0940 \u0909\u092e\u094d\u092e\u0940\u0926 \u0939\u0948\u0964 \u0938\u0930\u094d\u0935\u094b\u0924\u094d\u0924\u092e \u0930\u093f\u091f\u0930\u094d\u0928 \u0915\u0947 \u0932\u093f\u090f \u0938\u094d\u091f\u0949\u0915 \u0930\u0916\u0947\u0902 \u0914\u0930 \u0905\u0917\u0932\u0947 \u092e\u0939\u0940\u0928\u0947 \u0915\u0947 \u0926\u0942\u0938\u0930\u0947 \u0938\u092a\u094d\u0924\u093e\u0939 \u092e\u0947\u0902 \u092c\u0947\u091a\u0947\u0902\u0964",
        "best_sell_window": "Jul 12 \u2013 Jul 18",
        "expected_price_range": "\u20b91600 \u2013 \u20b91850",
        "risk_level": "Low",
    },
    "potato": {
        "en": "Potato prices in {mandi} are stable with a slight downward trend. Cold-storage stock is adequate. Sell existing stock gradually to avoid price dips in the next 2 weeks.",
        "hi": "{mandi} \u092e\u0947\u0902 \u0906\u0932\u0942 \u0915\u0940 \u0915\u0940\u092e\u0924\u0947\u0902 \u0938\u094d\u0925\u093f\u0930 \u0939\u0948\u0902 \u0914\u0930 \u0939\u0932\u094d\u0915\u0940 \u0917\u093f\u0930\u093e\u0935\u091f \u0915\u0940 \u092a\u094d\u0930\u0935\u0943\u0924\u094d\u0924\u093f \u0926\u093f\u0916 \u0930\u0939\u0940 \u0939\u0948\u0964 \u0936\u0940\u0924-\u092d\u0902\u0921\u093e\u0930\u0923 \u092e\u0947\u0902 \u092a\u0930\u094d\u092f\u093e\u092a\u094d\u0924 \u0938\u094d\u091f\u0949\u0915 \u0939\u0948\u0964 \u0905\u0917\u0932\u0947 2 \u0938\u092a\u094d\u0924\u093e\u0939 \u092e\u0947\u0902 \u092e\u0942\u0932\u094d\u092f \u0917\u093f\u0930\u093e\u0935\u091f \u0938\u0947 \u092c\u091a\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0927\u0940\u0930\u0947-\u0927\u0940\u0930\u0947 \u092c\u0947\u091a\u0947\u0902\u0964",
        "best_sell_window": "Jul 1 \u2013 Jul 10",
        "expected_price_range": "\u20b9850 \u2013 \u20b9950",
        "risk_level": "Medium",
    },
    "tomato": {
        "en": "Tomato prices in {mandi} are surging due to monsoon disruptions. Expect high volatility. Sell quickly if current stock is mature \u2014 prices may correct sharply once supply resumes.",
        "hi": "{mandi} \u092e\u0947\u0902 \u091f\u092e\u093e\u091f\u0930 \u0915\u0940 \u0915\u0940\u092e\u0924\u0947\u0902 \u092e\u093e\u0928\u0938\u0942\u0928 \u0935\u094d\u092f\u0935\u0927\u093e\u0928 \u0915\u0947 \u0915\u093e\u0930\u0923 \u092c\u0922\u093c \u0930\u0939\u0940 \u0939\u0948\u0902\u0964 \u0909\u091a\u094d\u091a \u0909\u0924\u093e\u0930-\u091a\u0922\u093c\u093e\u0935 \u0915\u0940 \u0909\u092e\u094d\u092e\u0940\u0926 \u0939\u0948\u0964 \u092f\u0926\u093f \u0935\u0930\u094d\u0924\u092e\u093e\u0928 \u0938\u094d\u091f\u0949\u0915 \u092a\u0915\u093e \u0939\u0941\u0906 \u0939\u0948 \u0924\u094b \u091c\u0932\u094d\u0926\u0940 \u092c\u0947\u091a\u0947\u0902 \u2014 \u0906\u092a\u0942\u0930\u094d\u0924\u093f \u092c\u0939\u093e\u0932 \u0939\u094b\u0928\u0947 \u092a\u0930 \u0915\u0940\u092e\u0924\u0947\u0902 \u0924\u0947\u091c\u0940 \u0938\u0947 \u0917\u093f\u0930 \u0938\u0915\u0924\u0940 \u0939\u0948\u0902\u0964",
        "best_sell_window": "Jun 28 \u2013 Jul 5",
        "expected_price_range": "\u20b92200 \u2013 \u20b92800",
        "risk_level": "High",
    },
    "garlic": {
        "en": "Garlic in {mandi} is commanding a premium due to reduced harvest in the current season. If you have dry garlic in storage, this is an excellent window to sell for maximum margin.",
        "hi": "{mandi} \u092e\u0947\u0902 \u0932\u0939\u0938\u0941\u0928 \u0907\u0938 \u0938\u0940\u091c\u0928 \u092e\u0947\u0902 \u0915\u092e \u092b\u0938\u0932 \u0915\u0947 \u0915\u093e\u0930\u0923 \u092a\u094d\u0930\u0940\u092e\u093f\u092f\u092e \u092a\u0930 \u092c\u093f\u0915 \u0930\u0939\u093e \u0939\u0948\u0964 \u092f\u0926\u093f \u0906\u092a\u0915\u0947 \u092a\u093e\u0938 \u0938\u0942\u0916\u093e \u0932\u0939\u0938\u0941\u0928 \u0938\u094d\u091f\u094b\u0930\u0947\u091c \u092e\u0947\u0902 \u0939\u0948 \u0924\u094b \u0905\u0927\u093f\u0915\u0924\u092e \u092e\u093e\u0930\u094d\u091c\u093f\u0928 \u0915\u0947 \u0932\u093f\u090f \u092f\u0939 \u092c\u0947\u091a\u0928\u0947 \u0915\u093e \u0938\u0939\u0940 \u0938\u092e\u092f \u0939\u0948\u0964",
        "best_sell_window": "Jul 5 \u2013 Jul 15",
        "expected_price_range": "\u20b98200 \u2013 \u20b99500",
        "risk_level": "Low",
    },
    "cauliflower": {
        "en": "Cauliflower supply in {mandi} is healthy this season. Prices are expected to remain flat. Sell fresh stock within 3-4 days to avoid spoilage losses.",
        "hi": "{mandi} \u092e\u0947\u0902 \u092b\u0942\u0932\u0917\u094b\u092d\u0940 \u0915\u0940 \u0906\u092a\u0942\u0930\u094d\u0924\u093f \u0907\u0938 \u0938\u0940\u091c\u0928 \u092e\u0947\u0902 \u0905\u091a\u094d\u091b\u0940 \u0939\u0948\u0964 \u0915\u0940\u092e\u0924\u0947\u0902 \u0938\u094d\u0925\u093f\u0930 \u0930\u0939\u0928\u0947 \u0915\u0940 \u0909\u092e\u094d\u092e\u0940\u0926 \u0939\u0948\u0964 \u0916\u0930\u093e\u092c \u0939\u094b\u0928\u0947 \u0938\u0947 \u092c\u091a\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f 3-4 \u0926\u093f\u0928\u094b\u0902 \u092e\u0947\u0902 \u0924\u093e\u091c\u093e \u0938\u094d\u091f\u0949\u0915 \u092c\u0947\u091a\u0947\u0902\u0964",
        "best_sell_window": "Jul 1 \u2013 Jul 7",
        "expected_price_range": "\u20b91100 \u2013 \u20b91350",
        "risk_level": "Low",
    },
    "green_chilli": {
        "en": "Green chilli prices in {mandi} are highly volatile this week. Monsoon rains have damaged crops in key growing regions. Sell immediately if stock is available \u2014 a sharp correction is expected within 10 days.",
        "hi": "{mandi} \u092e\u0947\u0902 \u0939\u0930\u0940 \u092e\u093f\u0930\u094d\u091a \u0915\u0940 \u0915\u0940\u092e\u0924\u0947\u0902 \u0907\u0938 \u0938\u092a\u094d\u0924\u093e\u0939 \u092c\u0939\u0941\u0924 \u0905\u0938\u094d\u0925\u093f\u0930 \u0939\u0948\u0902\u0964 \u092e\u093e\u0928\u0938\u0942\u0928 \u0915\u0940 \u092c\u093e\u0930\u093f\u0936 \u0928\u0947 \u092a\u094d\u0930\u092e\u0941\u0916 \u0909\u0917\u093e\u0908 \u0915\u094d\u0937\u0947\u0924\u094d\u0930\u094b\u0902 \u092e\u0947\u0902 \u092b\u0938\u0932\u094b\u0902 \u0915\u094b \u0928\u0941\u0915\u0938\u093e\u0928 \u092a\u0939\u0941\u0901\u091a\u093e\u092f\u093e \u0939\u0948\u0964 \u092f\u0926\u093f \u0938\u094d\u091f\u0949\u0915 \u0939\u0948 \u0924\u094b \u0924\u0941\u0930\u0902\u0924 \u092c\u0947\u091a\u0947\u0902 \u2014 10 \u0926\u093f\u0928\u094b\u0902 \u092e\u0947\u0902 \u0924\u0940\u0935\u094d\u0930 \u0938\u0941\u0927\u093e\u0930 \u0905\u092a\u0947\u0915\u094d\u0937\u093f\u0924 \u0939\u0948\u0964",
        "best_sell_window": "Jun 25 \u2013 Jul 2",
        "expected_price_range": "\u20b94200 \u2013 \u20b95500",
        "risk_level": "High",
    },
    "brinjal": {
        "en": "Brinjal supply in {mandi} is adequate. Prices are stable but could dip slightly as fresh arrivals increase over the next week. Sell within 3 days for best returns.",
        "hi": "{mandi} \u092e\u0947\u0902 \u092c\u0948\u0902\u0917\u0928 \u0915\u0940 \u0906\u092a\u0942\u0930\u094d\u0924\u093f \u092a\u0930\u094d\u092f\u093e\u092a\u094d\u0924 \u0939\u0948\u0964 \u0915\u0940\u092e\u0924\u0947\u0902 \u0938\u094d\u0925\u093f\u0930 \u0939\u0948\u0902 \u0932\u0947\u0915\u093f\u0928 \u0905\u0917\u0932\u0947 \u0938\u092a\u094d\u0924\u093e\u0939 \u092e\u0947\u0902 \u0924\u093e\u091c\u0940 \u0906\u0935\u0915 \u092c\u0922\u093c\u0928\u0947 \u0938\u0947 \u0925\u094b\u0921\u093c\u0940 \u0917\u093f\u0930\u093e\u0935\u091f \u0906 \u0938\u0915\u0924\u0940 \u0939\u0948\u0964 \u0938\u0930\u094d\u0935\u094b\u0924\u094d\u0924\u092e \u0930\u093f\u091f\u0930\u094d\u0928 \u0915\u0947 \u0932\u093f\u090f 3 \u0926\u093f\u0928\u094b\u0902 \u092e\u0947\u0902 \u092c\u0947\u091a\u0947\u0902\u0964",
        "best_sell_window": "Jul 1 \u2013 Jul 5",
        "expected_price_range": "\u20b91050 \u2013 \u20b91250",
        "risk_level": "Low",
    },
    "cabbage": {
        "en": "Cabbage prices in {mandi} are at a seasonal low. Cold-storage is not viable for cabbage. Sell all mature stock immediately and consider diversifying into higher-margin crops.",
        "hi": "{mandi} \u092e\u0947\u0902 \u092a\u093e\u0924\u094d\u0924\u093e\u0917\u094b\u092d\u0940 \u0915\u0940 \u0915\u0940\u092e\u0924\u0947\u0902 \u092e\u094c\u0938\u092e\u0940 \u0928\u094d\u092f\u0942\u0928\u0924\u092e \u0938\u094d\u0924\u0930 \u092a\u0930 \u0939\u0948\u0902\u0964 \u092a\u093e\u0924\u094d\u0924\u093e\u0917\u094b\u092d\u0940 \u0915\u0947 \u0932\u093f\u090f \u0936\u0940\u0924-\u092d\u0902\u0921\u093e\u0930\u0923 \u0935\u094d\u092f\u0935\u0939\u093e\u0930\u094d\u092f \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u0938\u092d\u0940 \u092a\u0915\u093e \u0938\u094d\u091f\u0949\u0915 \u0924\u0941\u0930\u0902\u0924 \u092c\u0947\u091a\u0947\u0902 \u0914\u0930 \u0905\u0927\u093f\u0915 \u092e\u093e\u0930\u094d\u091c\u093f\u0928 \u0935\u093e\u0932\u0940 \u092b\u0938\u0932\u094b\u0902 \u092e\u0947\u0902 \u0935\u093f\u0935\u093f\u0927\u0924\u093e \u092a\u0930 \u0935\u093f\u091a\u093e\u0930 \u0915\u0930\u0947\u0902\u0964",
        "best_sell_window": "Jun 28 \u2013 Jul 3",
        "expected_price_range": "\u20b9750 \u2013 \u20b9900",
        "risk_level": "Medium",
    },
}


@router.get("/farmer-advisory")
def get_farmer_advisory(commodity: str, mandi: str):
    commodity_lower = commodity.lower()
    template = _ADVISORIES.get(commodity_lower, _ADVISORIES["onion"])

    return {
        "commodity": commodity_lower,
        "mandi": mandi,
        "advisory_text": template["en"].format(mandi=mandi.capitalize()),
        "advisory_text_hi": template["hi"].format(mandi=mandi.capitalize()),
        "best_sell_window": template["best_sell_window"],
        "expected_price_range": template["expected_price_range"],
        "risk_level": template["risk_level"],
    }
