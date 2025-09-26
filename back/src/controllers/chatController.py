import uuid
from src.services.bd import (
    create_conversation,
    get_conversation_messages,
    update_conversation
)

from src.services.llm import handle_llm_message

async def post_message(session_id: str = None, message: str = ""):
    if not session_id:
        session_id = create_conversation()
        conversation = [{"cargo": "system", "content": "Início da conversa"}]
    else:
        conversation = get_conversation_messages(session_id)
        if not conversation:
            raise ValueError("Conversa não encontrada")

    ai_reply = handle_llm_message(conversation, message)

    update_conversation(session_id, {"cargo": "user", "body": message})
    update_conversation(session_id, {"cargo": "ai", "body": ai_reply})

    return {"session_id": session_id, "reply": ai_reply}
