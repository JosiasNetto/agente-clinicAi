from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.controllers.chatController import (
    get_conversation_messages, 
    get_conversations, post_conversation, 
    post_message,
    get_conversation_triage
)
from src.models.conversaModels import (
    ConversationRequest, MessageRequest
)

router = APIRouter()

@router.get("/messages/{session_id}")
async def a_get_conversation_messages(session_id: str):
    '''Obter o histórico de mensagens de uma conversa específica pelo id da sessão'''
    return await get_conversation_messages(session_id=session_id)

@router.get("/triage/{session_id}")
async def a_get_conversation_triage(session_id: str):
    '''Obter os dados de triagem de uma conversa específica pelo id da sessão'''
    return await get_conversation_triage(session_id=session_id)

@router.get("/{numero_paciente}")
async def a_get_conversations(numero_paciente: str):
    '''Obter todas as conversas de um paciente específico pelo número de telefone do paciente'''
    return await get_conversations(numero_paciente=numero_paciente)

@router.post("/")
async def a_post_conversation(request: ConversationRequest):
    '''Iniciar uma nova conversa para um paciente específico pelo número de telefone do paciente'''
    return await post_conversation(numero_paciente=request.numero_paciente)

@router.post("/message")
async def a_post_message(request: MessageRequest):
    '''Enviar uma mensagem em uma conversa existente ou iniciar uma nova conversa sem o número do paciente'''
    return await post_message(session_id=request.session_id, message=request.message)
