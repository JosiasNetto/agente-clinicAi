from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from  src.routes.chatRoutes import router as chat_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/chat", tags=["chat"])

