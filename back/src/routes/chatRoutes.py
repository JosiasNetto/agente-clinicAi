from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.controllers.chatController import post_message
from src.models.conversaModels import MessageRequest

router = APIRouter()

@router.post("/message")
async def a_post_message(request: MessageRequest):
    return await post_message(session_id=request.session_id, message=request.message)
