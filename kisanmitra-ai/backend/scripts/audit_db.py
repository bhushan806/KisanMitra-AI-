import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from database import sync_db


def verify_db():
    print("--- Database Verification ---")
    for coll_name in ["market_prices", "satellite_data", "weather_cache"]:
        count = sync_db[coll_name].count_documents({})
        print(f"Collection '{coll_name}': {count} documents")


if __name__ == "__main__":
    verify_db()
