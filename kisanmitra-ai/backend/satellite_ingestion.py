import os
import sys
import ee
from datetime import datetime, timedelta
import logging
from dotenv import load_dotenv

# Setup relative paths so it can import backend modules
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.append(SCRIPT_DIR)

from database import get_sync_collection

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# District approximate coordinates (Longitude, Latitude)
DISTRICTS = {
    "Nashik": [73.7898, 19.9975],
    "Pune": [73.8567, 18.5204],
    "Jalgaon": [75.5626, 21.0077],
    "Ahmednagar": [74.7350, 19.0952]
}

def authenticate_and_initialize():
    """Initializes Google Earth Engine. Authenticates if needed."""
    load_dotenv()
    gee_project_id = os.getenv("GEE_PROJECT_ID")
    
    if not gee_project_id:
        logger.error("GEE_PROJECT_ID is missing from the environment. Please add it to backend/.env")
        sys.exit(1)
        
    try:
        ee.Initialize(project=gee_project_id)
        logger.info(f"Successfully initialized Earth Engine with project: {gee_project_id}")
    except Exception as e:
        logger.error(f"Failed to initialize Earth Engine: {e}")
        logger.warning("Attempting to authenticate. This may require interactive login in the terminal.")
        try:
            ee.Authenticate()
            ee.Initialize(project=gee_project_id)
            logger.info(f"Successfully initialized Earth Engine with project: {gee_project_id}")
        except Exception as auth_e:
            logger.error(f"Authentication failed: {auth_e}")
            sys.exit(1)

def get_ndvi_for_district(district_name, coords, start_date, end_date):
    """
    Fetches average NDVI for a district over a given date range using Sentinel-2.
    """
    # Create a 30km buffer around the district center point as an approximate region
    point = ee.Geometry.Point(coords)
    region = point.buffer(30000) 
    
    # Sentinel-2 Harmonized Surface Reflectance
    s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
    
    filtered = (s2.filterBounds(region)
                  .filterDate(start_date, end_date)
                  # Filter out cloudy images if possible
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)))
    
    # Check if images exist in the range
    try:
        count = filtered.size().getInfo()
        if count == 0:
            logger.warning(f"No valid Sentinel-2 images found for {district_name} between {start_date} and {end_date}.")
            return None
    except Exception as e:
        logger.error(f"Error checking image collection size: {e}")
        return None

    # Calculate NDVI: (B8 - B4) / (B8 + B4)
    def calculate_ndvi(image):
        ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
        return image.addBands(ndvi)

    with_ndvi = filtered.map(calculate_ndvi)
    
    # Calculate median over the time period
    median_image = with_ndvi.select('NDVI').median()
    
    # Reduce region to get the mean NDVI value
    stats = median_image.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=region,
        scale=1000,  # 1km scale to keep computation fast
        maxPixels=1e9
    )
    
    try:
        ndvi_val = stats.get('NDVI').getInfo()
        return ndvi_val
    except Exception as e:
        logger.error(f"Error extracting NDVI for {district_name}: {e}")
        return None

def ingest_satellite_data(start_date_str, end_date_str=None):
    """
    Orchestrates the ingestion of satellite data for supported districts and stores it in MongoDB.
    """
    authenticate_and_initialize()
    
    db_collection = get_sync_collection("satellite_data")
    
    # Handle single date input
    start_dt = datetime.strptime(start_date_str, "%Y-%m-%d")
    if not end_date_str:
        end_dt = start_dt + timedelta(days=1)
        end_date_str = end_dt.strftime("%Y-%m-%d")
        
    logger.info(f"Ingesting Sentinel-2 satellite data for period: {start_date_str} to {end_date_str}")
    
    ingested_records = 0
    
    for district, coords in DISTRICTS.items():
        logger.info(f"Fetching NDVI for {district}...")
        ndvi_value = get_ndvi_for_district(district, coords, start_date_str, end_date_str)
        
        if ndvi_value is not None:
            # Upsert into MongoDB
            record = {
                "district": district,
                "date": start_date_str,
                "ndvi": float(ndvi_value),
                "source": "Sentinel-2"
            }
            
            db_collection.update_one(
                {"district": district, "date": start_date_str},
                {"$set": record},
                upsert=True
            )
            ingested_records += 1
            logger.info(f"Successfully saved NDVI={ndvi_value:.4f} for {district} on {start_date_str}.")
        else:
            logger.warning(f"Could not retrieve NDVI for {district} on {start_date_str}.")
            
    logger.info(f"Satellite ingestion completed. Inserted/Updated {ingested_records} records.")

if __name__ == "__main__":
    # If run directly, fetch for the past 7 days by default to backfill recently
    today = datetime.utcnow()
    for i in range(1, 8):
        dt = today - timedelta(days=i)
        ingest_satellite_data(dt.strftime("%Y-%m-%d"))
