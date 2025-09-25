import uuid
from src.services.bd import (
    create_conversation,
    get_conversation,
    update_conversation
)

from src.services.llm import handle_llm_message

async def post_message(session_id: str = None, message: str = ""):
    if not session_id:
        session_id = await create_conversation()
    else:
        conversation = await get_conversation(session_id)
        if not conversation:
            raise ValueError("Conversa não encontrada")

    ai_reply = handle_llm_message(conversation["history"], message)

    await update_conversation(session_id, {"cargo": "user", "body": message})
    await update_conversation(session_id, {"cargo": "ai", "body": ai_reply})

    return {"session_id": session_id, "reply": ai_reply}
