import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

IA_API_KEY = os.environ.get("IA_API_KEY")
if not IA_API_KEY:
    raise ValueError("IA_API_KEY não está definido nas variáveis de ambiente")

genai.configure(api_key=IA_API_KEY)

client = genai