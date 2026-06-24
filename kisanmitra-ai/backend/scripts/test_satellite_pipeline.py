import os
import sys
import logging
from datetime import datetime, timedelta

# Setup relative paths so it can import backend modules
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

from satellite_ingestion import ingest_satellite_data
from database import get_sync_collection

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_pipeline():
    logger.info("Starting satellite pipeline test...")
    
    # Test for exactly 2 days ago to ensure data is likely available and we don't spam the API
    test_dt = datetime.utcnow() - timedelta(days=5)
    test_date_str = test_dt.strftime("%Y-%m-%d")
    
    logger.info(f"Running ingestion for date: {test_date_str}")
    ingest_satellite_data(test_date_str)
    
    # Verify in MongoDB
    db_collection = get_sync_collection("satellite_data")
    count = db_collection.count_documents({"date": test_date_str})
    
    logger.info("====================================")
    if count > 0:
        logger.info(f"SUCCESS: Found {count} records in MongoDB for {test_date_str}.")
        records = db_collection.find({"date": test_date_str}, {"_id": 0})
        for r in records:
            logger.info(f"  -> {r}")
    else:
        logger.warning(f"FAILURE/WARNING: No records found in MongoDB for {test_date_str}. (This could happen if no non-cloudy images were available for this specific date across all 4 districts).")
    logger.info("====================================")

if __name__ == "__main__":
    test_pipeline()
