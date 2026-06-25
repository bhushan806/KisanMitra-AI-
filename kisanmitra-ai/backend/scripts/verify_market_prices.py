import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from database import sync_db


def run_verification():
    coll = sync_db["market_prices"]
    count = coll.count_documents({})
    print(f"MARKET_PRICES_COUNT={count}")

    if count > 0:
        samples = list(coll.find({}, {"_id": 0}).limit(5))
        print("SAMPLES:")
        for s in samples:
            print(s)

        commodities = coll.distinct("commodity")
        print(f"COMMODITIES={commodities}")

        # Get date range
        min_date = coll.find_one({}, sort=[("date", 1)])
        max_date = coll.find_one({}, sort=[("date", -1)])
        print(f"DATE_RANGE={min_date.get('date')} to {max_date.get('date')}")
    else:
        print("SAMPLES=None")
        print("COMMODITIES=None")
        print("DATE_RANGE=None")


if __name__ == "__main__":
    run_verification()
