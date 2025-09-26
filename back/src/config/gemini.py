import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY não está definido nas variáveis de ambiente")

genai.configure(api_key=API_KEY)

client = genai