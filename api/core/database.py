import os
from motor.motor_asyncio import AsyncIOMotorClient

# Should be in .env in production
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(MONGO_URL)
    print("Connected to MongoDB")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Closed MongoDB connection")

def get_database():
    return db.client["manak_ai_db"]
