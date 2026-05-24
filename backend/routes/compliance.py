from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import sqlite3
from datetime import datetime
from database import DB_PATH
from routes.auth import get_current_user

router = APIRouter()

class ResolveAlert(BaseModel):
    alert_id: int

@router.get("/alerts")
def get_alerts(status: str = None, current_user: dict = Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    advisor_id = current_user["id"]

    query = """
        SELECT ca.*, c.name as client_name, c.aum
        FROM compliance_alerts ca
        JOIN clients c ON ca.client_id = c.id
        WHERE ca.advisor_id=?
    """
    params = [advisor_id]
    if status:
        query += " AND ca.status=?"
        params.append(status)
    query += " ORDER BY ca.created_at DESC"

    alerts = conn.execute(query, params).fetchall()
    conn.close()

    high = [a for a in alerts if a["severity"] == "high"]
    medium = [a for a in alerts if a["severity"] == "medium"]
    low = [a for a in alerts if a["severity"] == "low"]

    active_count = sum(1 for a in alerts if a["status"] == "active")
    resolved_count = sum(1 for a in alerts if a["status"] == "resolved")
    total = len(alerts)
    score = round(((total - active_count) / total * 100) if total > 0 else 100, 1)

    return {
        "compliance_score": score,
        "total_alerts": total,
        "active_alerts": active_count,
        "resolved_alerts": resolved_count,
        "alerts": {
            "high": [dict(a) for a in high],
            "medium": [dict(a) for a in medium],
            "low": [dict(a) for a in low]
        }
    }

@router.post("/resolve/{alert_id}")
def resolve_alert(alert_id: int, current_user: dict = Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    alert = conn.execute(
        "SELECT * FROM compliance_alerts WHERE id=? AND advisor_id=?",
        (alert_id, current_user["id"])
    ).fetchone()

    if not alert:
        conn.close()
        raise HTTPException(status_code=404, detail="Alert not found")

    conn.execute("""
        UPDATE compliance_alerts SET status='resolved', resolved_at=?
        WHERE id=?
    """, (datetime.utcnow().isoformat(), alert_id))
    conn.commit()
    conn.close()
    return {"message": "Alert resolved successfully", "alert_id": alert_id}

@router.get("/pretrade-check/{client_id}")
def pretrade_check(client_id: int, amount: float = 0, current_user: dict = Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    client = conn.execute(
        "SELECT * FROM clients WHERE id=? AND advisor_id=?",
        (client_id, current_user["id"])
    ).fetchone()
    conn.close()

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    flags = []
    passed = True

    if amount > 500000:
        flags.append({"rule": "Large Transaction", "severity": "high", "detail": f"${amount:,.0f} exceeds $500K threshold. Requires supervisor approval."})
        passed = False
    if client["risk_profile"] == "Conservative" and amount > client["aum"] * 0.1:
        flags.append({"rule": "Suitability Check", "severity": "medium", "detail": "Trade size exceeds 10% of conservative client AUM."})
        passed = False

    return {
        "client": client["name"],
        "trade_amount": amount,
        "passed": passed,
        "flags": flags,
        "recommendation": "Approved" if passed else "Manual review required before execution"
    }
