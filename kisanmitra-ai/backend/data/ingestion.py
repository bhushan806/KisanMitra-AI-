import os
import sys
import httpx
import logging
import xml.etree.ElementTree as ET
from datetime import datetime
from pymongo import MongoClient, UpdateOne
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv

# Ensure backend directory is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from database import get_sync_collection
from utils.retry import with_retry

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("AgmarknetIngestion")

load_dotenv()

DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY")
AGMARKNET_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

if not DATA_GOV_API_KEY:
    logger.error("DATA_GOV_API_KEY not set in .env. Exiting.")
    sys.exit(1)

COMMODITIES = [
    "Onion",
    "Potato",
    "Tomato",
    "Garlic",
    "Cauliflower",
    "Green Chilli",
    "Brinjal",
    "Cabbage",
]

def setup_mongodb():
    """Verify MongoDB connection and set up indexes."""
    try:
        # Check connection
        client = get_sync_collection("market_prices").database.client
        client.admin.command("ping")
        
        market_prices = get_sync_collection("market_prices")
        ingestion_state = get_sync_collection("ingestion_state")

        # Create optimizations: compound index for upserts
        market_prices.create_index([("commodity", 1), ("date", 1), ("market", 1)], unique=True)
        market_prices.create_index([("commodity", 1)])
        market_prices.create_index([("date", -1)])
        
        ingestion_state.create_index([("commodity", 1)], unique=True)

        logger.info("MongoDB connected and indexes verified.")
        return market_prices, ingestion_state
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        sys.exit(1)

def get_ingestion_state(state_collection, commodity):
    state = state_collection.find_one({"commodity": commodity})
    if state:
        return state.get("offset", 0)
    return 0

def update_ingestion_state(state_collection, commodity, offset, status="running"):
    state_collection.update_one(
        {"commodity": commodity},
        {"$set": {
            "offset": offset,
            "status": status,
            "last_run": datetime.utcnow().isoformat()
        }},
        upsert=True
    )

@with_retry(max_retries=5, base_delay=2, max_delay=60)
def fetch_agmarknet_data(commodity, offset, limit=1000):
    params = {
        "api-key": DATA_GOV_API_KEY,
        "format": "xml",
        "filters[commodity]": commodity,
        "limit": limit,
        "offset": offset
    }
    logger.info(f"Fetching {commodity} data with offset {offset}...")
    with httpx.Client(timeout=30.0) as client:
        resp = client.get(AGMARKNET_URL, params=params)
        resp.raise_for_status()
        return resp.text

def parse_agmarknet_xml(xml_content, target_commodity):
    """
    Parses the Agmarknet XML response and maps it to the MongoDB schema.
    """
    records = []
    try:
        root = ET.fromstring(xml_content)
        records_node = root.find("records")
        if records_node is None:
            return records
            
        for item in records_node.findall("item"):
            # Extract fields
            commodity = item.findtext("commodity") or target_commodity
            arrival_date_str = item.findtext("arrival_date")
            modal_price_str = item.findtext("modal_price")
            state = item.findtext("state")
            market = item.findtext("market")
            
            # Safe parsing
            if not arrival_date_str or not modal_price_str:
                continue
                
            try:
                # Agmarknet dates are usually DD/MM/YYYY
                dt = datetime.strptime(arrival_date_str, "%d/%m/%Y")
                formatted_date = dt.strftime("%Y-%m-%d")
            except ValueError:
                # Fallback format if different
                formatted_date = arrival_date_str
                
            try:
                price = float(modal_price_str)
            except ValueError:
                continue

            doc = {
                "commodity": commodity.lower().replace(" ", "_"),
                "date": formatted_date,
                "price": price,
                "state": state,
                "market": market,
                "source": "agmarknet",
                "fetched_at": datetime.utcnow().isoformat()
            }
            records.append(doc)
    except ET.ParseError as e:
        logger.error(f"Failed to parse XML: {e}")
        
    return records

def save_market_prices(collection, records):
    if not records:
        return 0
        
    operations = []
    for doc in records:
        # Upsert based on commodity, date, and market
        op = UpdateOne(
            {
                "commodity": doc["commodity"],
                "date": doc["date"],
                "market": doc["market"]
            },
            {"$set": doc},
            upsert=True
        )
        operations.append(op)
        
    try:
        result = collection.bulk_write(operations, ordered=False)
        return result.upserted_count + result.modified_count
    except Exception as e:
        logger.error(f"Bulk write failed: {e}")
        return 0

def run_ingestion():
    market_prices, ingestion_state = setup_mongodb()
    
    total_fetched = 0
    total_inserted = 0
    
    logger.info("Starting real-time Agmarknet ingestion pipeline...")
    
    for comm in COMMODITIES:
        offset = get_ingestion_state(ingestion_state, comm)
        limit = 100  # Data.gov.in might limit to 100 or 1000 per page. Using 100 to be safe.
        consecutive_empty_batches = 0
        
        while True:
            try:
                xml_content = fetch_agmarknet_data(comm, offset, limit=limit)
                records = parse_agmarknet_xml(xml_content, comm)
                
                batch_fetched = len(records)
                total_fetched += batch_fetched
                
                if batch_fetched > 0:
                    batch_inserted = save_market_prices(market_prices, records)
                    total_inserted += batch_inserted
                    logger.info(f"[{comm}] Fetched: {batch_fetched}, Inserted/Updated: {batch_inserted}. Next offset: {offset + limit}")
                    offset += limit
                    update_ingestion_state(ingestion_state, comm, offset, status="running")
                    consecutive_empty_batches = 0
                else:
                    consecutive_empty_batches += 1
                    logger.info(f"[{comm}] No records found in batch. Empty batches: {consecutive_empty_batches}")
                    
                    if consecutive_empty_batches >= 3:
                        logger.info(f"[{comm}] Completed fetching available history.")
                        update_ingestion_state(ingestion_state, comm, offset, status="completed")
                        break
                        
            except Exception as e:
                logger.error(f"[{comm}] Ingestion failed at offset {offset}: {e}")
                update_ingestion_state(ingestion_state, comm, offset, status="failed")
                break
                
    logger.info("=========================================")
    logger.info("INGESTION COMPLETION SUMMARY")
    logger.info(f"Total Records Fetched : {total_fetched}")
    logger.info(f"Total Records Inserted/Updated: {total_inserted}")
    logger.info("=========================================")
    
if __name__ == "__main__":
    run_ingestion()
