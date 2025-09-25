from src.models.promptModel import prompt
from src.config.gemini import client
from google import genai

def generate_reply(conversation_history: list, user_message: str) -> str:
    context_text = ""
    for msg in conversation_history:
        if msg["role"] == "user":
            context_text += f"Paciente: {msg['content']}\n"
        else:
            context_text += f"Assistente: {msg['content']}\n"
    
    context_text += f"Paciente: {user_message}\nAssistente:"

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[context_text], 
        config=genai.types.GenerateContentConfig(
            system_instruction=prompt,
            temperature=0.7,
            max_output_tokens=256  
        )
    )
    
    reply_text = response.text
    return reply_text.strip()

def is_emergency(user_message: str) -> bool:
    emergency_keywords = [
        "emergência", "socorro", "ajuda", "dor intensa", "sangramento",
        "desmaio", "convulsão", "parada cardíaca", "dificuldade para respirar",
        "intoxicação", "fratura exposta", "queimadura grave",
        "dor no peito", "infarto", "falta de ar", "dificuldade para respirar", 
        "perda de consciência", "hemorragia", "sangramento intenso"
    ]
    for keyword in emergency_keywords:
        if keyword in user_message.lower():
            return True
    return False

def handle_llm_message(conversation_history: list, user_message: str) -> str:
    if is_emergency(user_message):
        return "Parece que você está enfrentando uma emergência médica. Por favor, ligue para o número de emergência local ou procure atendimento médico imediato."

    reply = generate_reply(conversation_history, user_message)
    return reply