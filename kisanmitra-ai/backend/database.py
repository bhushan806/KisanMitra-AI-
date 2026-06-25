import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from dotenv import load_dotenv
import certifi

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "kisanmitra_ai"

# Async Client for FastAPI routes
async_client = AsyncIOMotorClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=2000,  # Fail fast if IP is not whitelisted (2 seconds instead of 30)
)
async_db = async_client[DB_NAME]

# Sync Client for scripts and synchronous operations
sync_client = MongoClient(
    MONGO_URI, tls=True, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=2000
)
sync_db = sync_client[DB_NAME]


def get_async_collection(collection_name: str):
    return async_db[collection_name]


def get_sync_collection(collection_name: str):
    return sync_db[collection_name]
