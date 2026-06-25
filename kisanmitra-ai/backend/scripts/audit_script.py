import os
import sys
from importlib.util import find_spec

# PHASE 1: FILE AUDIT
files_to_check = [
    "backend/satellite_ingestion.py",
    "backend/scripts/test_satellite_pipeline.py",
    "backend/scripts/train_all_models.py",
    "backend/database.py",
    "backend/main.py",
]

print("=== PHASE 1: FILE AUDIT ===")
for f in files_to_check:
    path = os.path.join(os.getcwd(), f)
    if os.path.exists(path):
        print(f"[OK] {f} exists")
    else:
        print(f"[ERROR] {f} missing")

print("\nChecking key imports...")
deps = ["ee", "pandas", "numpy", "pymongo", "motor", "fastapi", "dotenv"]
for d in deps:
    if find_spec(d):
        print(f"[OK] {d} is installed")
    else:
        print(f"[ERROR] {d} is missing")

print("\n=== PHASE 3: MONGODB AUDIT ===")
try:
    sys.path.append(os.path.join(os.getcwd(), "backend"))
    from database import get_sync_collection

    collections = [
        "market_prices",
        "satellite_data",
        "engineered_features",
        "model_metrics",
        "predictions",
    ]
    for coll_name in collections:
        try:
            coll = get_sync_collection(coll_name)
            count = coll.count_documents({})
            sample = coll.find_one({}, {"_id": 0})
            print(f"Collection: {coll_name}")
            print(f"  Count: {count}")
            print(f"  Sample: {sample}")
        except Exception as e:
            print(f"  [ERROR] Failed to query {coll_name}: {e}")
except Exception as e:
    print(f"[ERROR] Database connection failed: {e}")
