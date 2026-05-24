from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn
from database import init_db
from routes import chat, portfolio, clients, compliance, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="Advisor AI - Intelligent Agent",
    description="AI-powered concierge for financial advisors",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,       prefix="/api/auth",       tags=["Authentication"])
app.include_router(chat.router,       prefix="/api/chat",       tags=["AI Chat"])
app.include_router(portfolio.router,  prefix="/api/portfolio",  tags=["Portfolio"])
app.include_router(clients.router,    prefix="/api/clients",    tags=["Clients"])
app.include_router(compliance.router, prefix="/api/compliance", tags=["Compliance"])

@app.get("/")
def root():
    return {"message": "Advisor AI Backend is running", "status": "ok", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
