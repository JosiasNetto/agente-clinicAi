from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.controllers.chatController import (
    post_conversation, post_message
)
from src.models.conversaModels import (
    ConversationRequest, MessageRequest
)

router = APIRouter()

@router.post("/")
async def a_post_conversation(request: ConversationRequest):
    return await post_conversation(numero_paciente=request.numero_paciente)

@router.post("/message")
async def a_post_message(request: MessageRequest):
    return await post_message(session_id=request.session_id, message=request.message)
