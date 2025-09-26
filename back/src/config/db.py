import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def connect_to_mongo():
    MONGODB_URL = os.getenv("MONGODB_URL")

    if not MONGODB_URL:
        raise ValueError("MONGODB_URL não está definido nas variáveis de ambiente")

    client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
    db = client.get_database("chatbot-clinica")

    return db

db = connect_to_mongo()