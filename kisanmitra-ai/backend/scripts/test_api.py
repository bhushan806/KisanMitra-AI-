import httpx
import json
import time
import subprocess
import os
import sys

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Start the server in background
print("Starting backend server for testing...")
process = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "main:app", "--port", "8000"],
    cwd=BACKEND_DIR,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

# Wait for server to be ready
time.sleep(3)

base_url = "http://localhost:8000"
endpoints = [
    ("GET", "/health", None),
    ("GET", "/api/predict?commodity=onion&mandi=lasalgaon&horizon=7", None),
    ("GET", "/api/predict?commodity=potato&mandi=agra&horizon=15", None),
    ("GET", "/api/predict?commodity=tomato&mandi=bangalore&horizon=30", None),
    ("GET", "/api/alerts", None),
    ("GET", "/api/commodities", None),
    ("GET", "/api/dashboard/summary", None),
    ("GET", "/api/crop-health?mandi=lasalgaon", None),
    ("GET", "/api/farmer-advisory?commodity=onion&mandi=lasalgaon", None),
]

results = {}
all_pass = True

print("Testing endpoints...")
with httpx.Client(timeout=10.0) as client:
    for method, url_path, data in endpoints:
        url = base_url + url_path
        try:
            if method == "GET":
                resp = client.get(url)
            elif method == "POST":
                resp = client.post(url, json=data)
                
            if resp.status_code == 200:
                print(f"PASS: {method} {url_path}")
                results[url_path] = {"status": "PASS", "response": resp.json()}
            else:
                print(f"FAIL: {method} {url_path} - Status: {resp.status_code}")
                print(resp.text)
                results[url_path] = {"status": "FAIL", "error": resp.text}
                all_pass = False
        except Exception as e:
            print(f"ERROR: {method} {url_path} - {e}")
            results[url_path] = {"status": "ERROR", "error": str(e)}
            all_pass = False

    # Specifically run POST /api/retrain?commodity=onion
    url_path = "/api/retrain?commodity=onion"
    url = base_url + url_path
    print(f"Testing POST {url_path}...")
    try:
        # Long timeout for retraining
        with httpx.Client(timeout=600.0) as long_client:
            resp = long_client.post(url)
            if resp.status_code == 200:
                print(f"PASS: POST {url_path}")
                results[url_path] = {"status": "PASS", "response": resp.json()}
            else:
                print(f"FAIL: POST {url_path} - Status: {resp.status_code}")
                print(resp.text)
                results[url_path] = {"status": "FAIL", "error": resp.text}
                all_pass = False
    except Exception as e:
        print(f"ERROR: POST {url_path} - {e}")
        results[url_path] = {"status": "ERROR", "error": str(e)}
        all_pass = False

process.terminate()

os.makedirs(os.path.join(BACKEND_DIR, "tests"), exist_ok=True)
output_file = os.path.join(BACKEND_DIR, "tests", "api_test_results.json")
with open(output_file, "w") as f:
    json.dump(results, f, indent=2)

print(f"Results saved to {output_file}")
if all_pass:
    print("ALL TESTS PASSED")
    sys.exit(0)
else:
    print("SOME TESTS FAILED")
    sys.exit(1)
