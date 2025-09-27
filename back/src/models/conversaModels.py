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

class MessageRequest(BaseModel):
    message: str
    session_id: str = None

class Conversa(BaseModel):
    numero_paciente: Optional[str] = None
    session_id: str
    mensagens: List[Mensagem] = []
    triagem: Optional[Triagem] = None


class ConversationRequest(BaseModel):
    numero_paciente: str
