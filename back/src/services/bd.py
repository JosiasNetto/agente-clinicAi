from src.config.db import db
import uuid
from src.models.conversaModels import (
    Conversa,
    Mensagem
)

def create_conversation():
    conversation_id = str(uuid.uuid4())
    conversa = Conversa(session_id=conversation_id, mensagens=[], triagem={})
    db.conversas.insert_one(conversa.dict())
    return conversation_id

def get_conversation_messages(session_id: str):
    conversation = db.conversas.find_one({"session_id": session_id})
    if conversation:
        return Conversa(**conversation).mensagens
    return None

def update_conversation(session_id: str, mensagem: dict):
    mensagem = Mensagem(**mensagem)
    db.conversas.update_one({"session_id": session_id}, {"$push": {"mensagens": mensagem.dict()}})