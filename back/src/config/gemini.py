from google import genai
import os

def get_gemini_client():
    API_KEY = os.environ.get("GEMINI_API_KEY")
    client = genai.Client(api_key=API_KEY)
    return client

client = get_gemini_client()
