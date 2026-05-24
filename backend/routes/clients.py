from fastapi import APIRouter, Depends, HTTPException, Query
import sqlite3, json
from database import DB_PATH
from routes.auth import get_current_user

router = APIRouter()

@router.get("/")
def list_clients(
    segment: str = None,
    risk_profile: str = None,
    search: str = None,
    current_user: dict = Depends(get_current_user)
):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    advisor_id = current_user["id"]

    query = "SELECT * FROM clients WHERE advisor_id=?"
    params = [advisor_id]

    if segment:
        query += " AND segment=?"
        params.append(segment)
    if risk_profile:
        query += " AND risk_profile=?"
        params.append(risk_profile)
    if search:
        query += " AND (name LIKE ? OR email LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])

    query += " ORDER BY aum DESC"
    clients = conn.execute(query, params).fetchall()
    conn.close()

    return {
        "clients": [dict(c) for c in clients],
        "total": len(clients)
    }

@router.get("/{client_id}")
def get_client(client_id: int, current_user: dict = Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    advisor_id = current_user["id"]

    client = conn.execute(
        "SELECT * FROM clients WHERE id=? AND advisor_id=?", (client_id, advisor_id)
    ).fetchone()

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    portfolios = conn.execute(
        "SELECT * FROM portfolios WHERE client_id=?", (client_id,)
    ).fetchall()

    alerts = conn.execute(
        "SELECT * FROM compliance_alerts WHERE client_id=? ORDER BY created_at DESC",
        (client_id,)
    ).fetchall()

    conn.close()

    client_dict = dict(client)
    try:
        client_dict["life_events"] = json.loads(client_dict.get("life_events") or "[]")
    except Exception:
        client_dict["life_events"] = []

    total_value = sum(p["current_value"] for p in portfolios)
    avg_ytd = sum(p["ytd_return"] for p in portfolios) / len(portfolios) if portfolios else 0

    return {
        "client": client_dict,
        "portfolio": {
            "total_value": round(total_value, 2),
            "avg_ytd_return": round(avg_ytd * 100, 2),
            "breakdown": [dict(p) for p in portfolios]
        },
        "compliance_alerts": [dict(a) for a in alerts]
    }

@router.get("/insights/life-events")
def life_event_clients(current_user: dict = Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    clients = conn.execute("""
        SELECT * FROM clients
        WHERE advisor_id=? AND life_events != '[]' AND life_events IS NOT NULL
        ORDER BY aum DESC
    """, (current_user["id"],)).fetchall()
    conn.close()
    result = []
    for c in clients:
        cd = dict(c)
        try:
            cd["life_events"] = json.loads(cd.get("life_events") or "[]")
        except Exception:
            cd["life_events"] = []
        if cd["life_events"]:
            result.append(cd)
    return {"clients": result}

@router.get("/insights/revenue-opportunities")
def revenue_opportunities(current_user: dict = Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    clients = conn.execute("""
        SELECT c.*, AVG(p.ytd_return) as avg_ytd
        FROM clients c
        LEFT JOIN portfolios p ON c.id = p.client_id
        WHERE c.advisor_id=?
        GROUP BY c.id
        ORDER BY c.aum DESC
    """, (current_user["id"],)).fetchall()
    conn.close()

    opportunities = []
    for c in clients:
        cd = dict(c)
        try:
            events = json.loads(cd.get("life_events") or "[]")
        except Exception:
            events = []

        opps = []
        if "retirement_planning" in events:
            opps.append({"type": "cross_sell", "product": "Annuity / Retirement Fund", "reason": "Retirement event detected", "est_value": round(cd["aum"] * 0.07, 0)})
        if "bond_maturity" in events:
            opps.append({"type": "reinvestment", "product": "REIT or Dividend Fund", "reason": "Bond maturity upcoming", "est_value": 200000})
        if "inheritance" in events:
            opps.append({"type": "upsell", "product": "Multi-asset portfolio upgrade", "reason": "Inheritance inflow expected", "est_value": 600000})
        if "risk_upgrade" in events:
            opps.append({"type": "upsell", "product": "Emerging Market Equity Fund", "reason": "Risk tolerance upgraded", "est_value": round(cd["aum"] * 0.05, 0)})
        if cd.get("avg_ytd", 0) and cd["avg_ytd"] < 0.01:
            opps.append({"type": "rebalance", "product": "Portfolio rebalancing", "reason": "Underperforming vs benchmark", "est_value": 0})

        if opps:
            opportunities.append({"client": cd["name"], "aum": cd["aum"], "segment": cd["segment"], "opportunities": opps})

    return {"opportunities": opportunities, "total_clients_with_opps": len(opportunities)}
