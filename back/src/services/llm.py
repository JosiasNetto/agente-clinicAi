from src.models.promptModel import ( 
    prompt_reply,
    prompt_triage
)
from src.config.gemini import client
import json
import re

def generate_reply(conversation_history: list, user_message: str) -> str:
    context_text = ""
    for msg in conversation_history:
        if msg.cargo == "user":
            context_text += f"Paciente: {msg.body}\n"
        elif msg.cargo == "ai":
            context_text += f"Assistente: {msg.body}\n"
        else:
            context_text = ""
    
    context_text += f"Paciente: {user_message}\nAssistente:"

    model = client.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=prompt_reply
    )

    response = model.generate_content(
        contents=context_text,
        generation_config={
            "temperature": 0.7,
            "max_output_tokens": 256
        }
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

def clean_json_response(response_text: str) -> str:

    response_text = re.sub(r'```json\s*', '', response_text)
    response_text = re.sub(r'```\s*$', '', response_text)
    response_text = re.sub(r'^```\s*', '', response_text)
    
    json_start = response_text.find('{')
    if json_start != -1:
        response_text = response_text[json_start:]
    
    json_end = response_text.rfind('}')
    if json_end != -1:
        response_text = response_text[:json_end + 1]
    
    return response_text.strip()


def generate_triage(conversation) -> dict:
    history_text = ""
    for msg in conversation:
        if msg.cargo == "user":
            history_text += f"Paciente: {msg.body}\n"
        elif msg.cargo == "ai":
            history_text += f"Assistente: {msg.body}\n"

    prompt = prompt_triage + history_text + "\nJSON:"

    model = client.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=prompt
    )

    response = model.generate_content(
        contents=prompt,
        generation_config={
            "temperature": 0.3,
            "max_output_tokens": 256
        }
    )

    try:
        cleaned_json = clean_json_response(response.text)
        triage_data = json.loads(cleaned_json)
        return triage_data
    except json.JSONDecodeError:
        return {}
