"""Quick smoke test for all KisanMitra API endpoints."""
import httpx
import json
import sys

BASE = "http://localhost:8000"

def test(name, url, expect_key=None):
    try:
        r = httpx.get(url, timeout=30.0)
        data = r.json()
        status = "PASS" if r.status_code == 200 else "FAIL"
        detail = ""
        if expect_key and expect_key in data:
            if isinstance(data[expect_key], list):
                detail = f" ({len(data[expect_key])} items)"
            elif isinstance(data[expect_key], dict):
                detail = f" ({len(data[expect_key])} keys)"
            else:
                detail = f" = {data[expect_key]}"
        print(f"  [{status}] {name}: {r.status_code}{detail}")
        if status == "FAIL":
            print(f"         Response: {json.dumps(data, indent=2)[:300]}")
        return status == "PASS"
    except Exception as e:
        print(f"  [FAIL] {name}: {e}")
        return False

print("=" * 60)
print("KisanMitra AI — API Smoke Test")
print("=" * 60)

results = []
results.append(test("Health Check", f"{BASE}/health", "status"))
results.append(test("Commodities", f"{BASE}/api/commodities", "commodities"))
results.append(test("Predict (onion/lasalgaon/7d)", f"{BASE}/api/predict?commodity=onion&mandi=lasalgaon&horizon=7", "forecast"))
results.append(test("Predict (potato/pune/15d)", f"{BASE}/api/predict?commodity=potato&mandi=pune&horizon=15", "forecast"))
results.append(test("Predict (tomato/bangalore/30d)", f"{BASE}/api/predict?commodity=tomato&mandi=bangalore&horizon=30", "forecast"))
results.append(test("Alerts", f"{BASE}/api/alerts", "alerts"))
results.append(test("Dashboard Summary", f"{BASE}/api/dashboard/summary", "model_accuracy"))
results.append(test("Crop Health (lasalgaon)", f"{BASE}/api/crop-health?mandi=lasalgaon", "ndvi_proxy"))
results.append(test("Farmer Advisory", f"{BASE}/api/farmer-advisory?commodity=onion&mandi=lasalgaon", "advisory_text"))

passed = sum(results)
total = len(results)
print(f"\nResults: {passed}/{total} passed")
if passed == total:
    print("ALL ENDPOINTS OPERATIONAL")
else:
    print(f"WARNING: {total - passed} endpoint(s) failed")
    sys.exit(1)
