from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
class Mensagem(BaseModel):
    cargo: str          
    body: str       
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Triagem(BaseModel):
    main_complaint: Optional[str] = None  
    sintomas: Optional[str] = None         
    duracao: Optional[str] = None         
    frequencia: Optional[str] = None        
    intensidade: Optional[int] = None        
    historico: Optional[str] = None          
    medidas_tomadas: Optional[str] = None
class Conversa(BaseModel):
    numero_paciente: Optional[str] = None
    session_id: str
    mensagens: List[Mensagem] = []
    triagem: Optional[Triagem] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

mensagem_inicial = '''Olá! Sou seu assistente de triagem médica. Vou fazer algumas 
perguntas para coletar e organizar seus dados de saúde. Como posso te ajudar a se 
preparar para sua consulta?'''

class MessageRequest(BaseModel):
    message: str
    session_id: str = None

class ConversationRequest(BaseModel):
    numero_paciente: str


