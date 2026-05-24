from fastapi import APIRouter, Depends, HTTPException
import sqlite3
from database import DB_PATH
from routes.auth import get_current_user

router = APIRouter()

@router.get("/summary")
def portfolio_summary(current_user: dict = Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    advisor_id = current_user["id"]

    clients = conn.execute(
        "SELECT id, name, aum FROM clients WHERE advisor_id=?", (advisor_id,)
    ).fetchall()

    total_aum = sum(c["aum"] for c in clients)

    portfolios = conn.execute("""
        SELECT p.asset_class, SUM(p.current_value) as total_value,
               AVG(p.ytd_return) as avg_ytd, AVG(p.benchmark_return) as avg_benchmark
        FROM portfolios p
        JOIN clients c ON p.client_id = c.id
        WHERE c.advisor_id=?
        GROUP BY p.asset_class
    """, (advisor_id,)).fetchall()

    top_performers = conn.execute("""
        SELECT c.name, c.aum, AVG(p.ytd_return) as ytd
        FROM clients c JOIN portfolios p ON c.id = p.client_id
        WHERE c.advisor_id=?
        GROUP BY c.id ORDER BY ytd DESC LIMIT 5
    """, (advisor_id,)).fetchall()

    rebalance_needed = conn.execute("""
        SELECT DISTINCT c.name, c.aum
        FROM clients c JOIN portfolios p ON c.id = p.client_id
        WHERE c.advisor_id=? AND ABS(p.allocation_pct - 65) > 5
        LIMIT 7
    """, (advisor_id,)).fetchall()

    conn.close()

    return {
        "total_aum": round(total_aum, 2),
        "client_count": len(clients),
        "asset_allocation": [
            {
                "asset_class": p["asset_class"],
                "total_value": round(p["total_value"], 2),
                "avg_ytd_return": round(p["avg_ytd"] * 100, 2),
                "avg_benchmark_return": round(p["avg_benchmark"] * 100, 2),
                "alpha": round((p["avg_ytd"] - p["avg_benchmark"]) * 100, 2)
            }
            for p in portfolios
        ],
        "top_performers": [
            {"name": c["name"], "aum": c["aum"], "ytd_return": round(c["ytd"] * 100, 2)}
            for c in top_performers
        ],
        "rebalance_needed": [
            {"name": c["name"], "aum": c["aum"]} for c in rebalance_needed
        ]
    }

@router.get("/client/{client_id}")
def client_portfolio(client_id: int, current_user: dict = Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    client = conn.execute(
        "SELECT * FROM clients WHERE id=? AND advisor_id=?",
        (client_id, current_user["id"])
    ).fetchone()

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    portfolios = conn.execute(
        "SELECT * FROM portfolios WHERE client_id=?", (client_id,)
    ).fetchall()

    transactions = conn.execute(
        "SELECT * FROM transactions WHERE client_id=? ORDER BY created_at DESC LIMIT 10",
        (client_id,)
    ).fetchall()

    conn.close()

    return {
        "client": dict(client),
        "portfolio": [dict(p) for p in portfolios],
        "recent_transactions": [dict(t) for t in transactions]
    }
