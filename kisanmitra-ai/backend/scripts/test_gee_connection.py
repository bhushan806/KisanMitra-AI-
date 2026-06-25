import os
import sys
import ee
from dotenv import load_dotenv

# Ensure we can import from backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


def test_gee_connection():
    load_dotenv()
    gee_project_id = os.getenv("GEE_PROJECT_ID")

    if not gee_project_id:
        print("ERROR: GEE_PROJECT_ID is missing from .env")
        sys.exit(1)

    try:
        ee.Initialize(project=gee_project_id)
        print("Earth Engine Connected")
        print(f"Project: {gee_project_id}")

        # Query Sentinel-2 collection for a recent date to verify access
        s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        filtered = s2.filterDate("2023-01-01", "2023-01-02").limit(10)

        count = filtered.size().getInfo()
        print(f"Sentinel Images Found: {count}")
    except Exception as e:
        print(f"ERROR: Failed to connect to Earth Engine - {e}")
        sys.exit(1)


if __name__ == "__main__":
    test_gee_connection()
