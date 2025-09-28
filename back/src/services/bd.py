from src.config.db import db
import uuid
from src.models.conversaModels import (
    Conversa,
    Mensagem
)

def create_conversation_bd(numero_paciente: str = None):
    session_id = str(uuid.uuid4())
    conversa = Conversa(session_id=session_id, mensagens=[], triagem={}, numero_paciente=numero_paciente)
    db.conversas.insert_one(conversa.dict())
    return session_id

def get_conversation_messages_bd(session_id: str):
    conversation = db.conversas.find_one({"session_id": session_id})
    if conversation:
        return Conversa(**conversation).mensagens
    return None

def get_conversations_by_number_bd(numero_paciente: str):
    conversations = db.conversas.find({"numero_paciente": numero_paciente})
    return [Conversa(**conv).dict() for conv in conversations]

def update_conversation_bd(session_id: str, mensagem: dict):
    mensagem = Mensagem(**mensagem)
    db.conversas.update_one({"session_id": session_id}, {"$push": {"mensagens": mensagem.dict()}})

def update_triage_bd(session_id: str, triage_data: dict):
    db.conversas.update_one({"session_id": session_id}, {"$set": {"triagem": triage_data}})