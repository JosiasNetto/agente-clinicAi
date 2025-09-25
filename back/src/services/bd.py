from src.config.db import db
import uuid

async def create_conversation():
    conversation_id = str(uuid.uuid4())
    await db.conversations.insert_one({"session_id": conversation_id, "mensagens": [], "triagem": {}})
    return conversation_id