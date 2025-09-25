from fastapi import APIRouter, HTTPException
from src.controllers.chatController import post_message

router = APIRouter()

@router.post("/message")
async def a_post_message(message: str, session_id: str = None):
    post_message(session_id, message)
