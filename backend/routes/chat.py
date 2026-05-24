from dotenv import load_dotenv
load_dotenv()
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import sqlite3, os, uuid, httpx
from database import DB_PATH
from routes.auth import get_current_user

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

def get_advisor_context(advisor_id: int) -> str:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    clients = conn.execute("SELECT name, risk_profile, aum, segment, life_events FROM clients WHERE advisor_id=?", (advisor_id,)).fetchall()
    alerts = conn.execute("SELECT ca.severity, ca.description, c.name FROM compliance_alerts ca JOIN clients c ON ca.client_id=c.id WHERE ca.advisor_id=? AND ca.status='active' LIMIT 5", (advisor_id,)).fetchall()
    portfolios = conn.execute("SELECT p.asset_class, SUM(p.current_value) as val, AVG(p.ytd_return) as ytd FROM portfolios p JOIN clients c ON p.client_id=c.id WHERE c.advisor_id=? GROUP BY p.asset_class", (advisor_id,)).fetchall()
    conn.close()
    total_aum = sum(c["aum"] for c in clients)
    clients_text = " | ".join([f"{c['name']}(${c['aum']/1e6:.1f}M,{c['risk_profile']})" for c in clients])
    alerts_text = "; ".join([f"{a['severity'].upper()}-{a[2]}: {a['description'][:50]}" for a in alerts]) or "None"
    portfolio_text = " | ".join([f"{p['asset_class']}:${p['val']:,.0f}({p['ytd']*100:.1f}%)" for p in portfolios])
    return f"""You are Advisor AI for Arjun Sharma. AUM:${total_aum:,.0f}. Date:{__import__('datetime').datetime.now().strftime('%b %d %Y')}.
CLIENTS: {clients_text}
ALERTS: {alerts_text}
PORTFOLIO: {portfolio_text}
Answer concisely using only this data. Use bullet points."""

def get_chat_history(advisor_id, session_id):
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("SELECT role, content FROM chat_history WHERE advisor_id=? AND session_id=? ORDER BY created_at ASC LIMIT 6", (advisor_id, session_id)).fetchall()
    conn.close()
    return [{"role": r[0], "content": r[1]} for r in rows]

def save_message(advisor_id, session_id, role, content):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("INSERT INTO chat_history (advisor_id, session_id, role, content) VALUES (?, ?, ?, ?)", (advisor_id, session_id, role, content))
    conn.commit()
    conn.close()

@router.post("/message")
async def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured. Please set it in .env file.")
    session_id = request.session_id or str(uuid.uuid4())
    advisor_id = current_user["id"]
    history = get_chat_history(advisor_id, session_id)
    messages = [{"role": "system", "content": get_advisor_context(advisor_id)}]
    for msg in history:
        messages.append({"role": "assistant" if msg["role"] == "assistant" else "user", "content": msg["content"]})
    messages.append({"role": "user", "content": request.message})
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                GROQ_API_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={"model": GROQ_MODEL, "messages": messages, "max_tokens": 512, "temperature": 0.7}
            )
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail=f"AI API error: {response.text}")
        ai_reply = response.json()["choices"][0]["message"]["content"]
        save_message(advisor_id, session_id, "user", request.message)
        save_message(advisor_id, session_id, "assistant", ai_reply)
        return {"reply": ai_reply, "session_id": session_id, "model": GROQ_MODEL}
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Timeout. Please try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{session_id}")
def get_history(session_id: str, current_user: dict = Depends(get_current_user)):
    return {"session_id": session_id, "messages": get_chat_history(current_user["id"], session_id)}

@router.get("/sessions")
def get_sessions(current_user: dict = Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("SELECT session_id, MIN(created_at) as started, COUNT(*) as msg_count FROM chat_history WHERE advisor_id=? GROUP BY session_id ORDER BY started DESC LIMIT 10", (current_user["id"],)).fetchall()
    conn.close()
    return {"sessions": [{"session_id": r[0], "started": r[1], "messages": r[2]} for r in rows]}
