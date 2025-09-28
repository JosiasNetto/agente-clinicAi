import uuid
from src.services.bd import (
    create_conversation,
    get_conversation_messages_bd,
    get_conversations_by_number,
    update_conversation,
    update_triage
)
from src.services.llm import generate_triage, handle_llm_message
from src.models.conversaModels import ( 
    Mensagem,
    mensagem_inicial
)

async def get_conversation_triage(session_id: str):
    conversation = get_conversation_messages_bd(session_id)
    if conversation is None:
        raise ValueError("Conversa não encontrada")
    triage = generate_triage(conversation)
    update_triage(session_id, triage)
    return triage

async def get_conversations(numero_paciente: str):
    conversations = get_conversations_by_number(numero_paciente)
    if not conversations:
        return []
    return conversations

async def get_conversation_messages(session_id: str):
    messages = get_conversation_messages_bd(session_id)
    if messages is None:
        raise ValueError("Conversa não encontrada")
    return messages

async def post_conversation(numero_paciente: str):
    session_id = create_conversation(numero_paciente)
    update_conversation(session_id, {"cargo": "ai", "body": mensagem_inicial})
    return {"session_id": session_id, "message": "Conversa iniciada com sucesso."}

async def post_message(session_id: str = None, message: str = ""):
    if not session_id:
        session_id = create_conversation()
        conversation = [Mensagem(cargo="ai", body=mensagem_inicial)]
    else:
        conversation = get_conversation_messages_bd(session_id)
        if not conversation:
            raise ValueError("Conversa não encontrada")

    ai_reply = handle_llm_message(conversation, message)

    update_conversation(session_id, {"cargo": "user", "body": message})
    update_conversation(session_id, {"cargo": "ai", "body": ai_reply})

    return {"session_id": session_id, "message": ai_reply}
