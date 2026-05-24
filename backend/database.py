import sqlite3
import os
from datetime import datetime, timedelta
import random

DB_PATH = os.path.join(os.path.dirname(__file__), "advisor_ai.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT DEFAULT 'advisor',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            advisor_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            age INTEGER,
            email TEXT,
            phone TEXT,
            risk_profile TEXT DEFAULT 'moderate',
            aum REAL DEFAULT 0,
            segment TEXT DEFAULT 'mass_affluent',
            life_events TEXT DEFAULT '',
            next_review_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (advisor_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS portfolios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER NOT NULL,
            asset_class TEXT NOT NULL,
            allocation_pct REAL NOT NULL,
            current_value REAL NOT NULL,
            ytd_return REAL DEFAULT 0,
            benchmark_return REAL DEFAULT 0,
            last_rebalanced TEXT,
            FOREIGN KEY (client_id) REFERENCES clients(id)
        );
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER NOT NULL,
            transaction_type TEXT NOT NULL,
            asset_class TEXT NOT NULL,
            amount REAL NOT NULL,
            description TEXT,
            transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id)
        );
        CREATE TABLE IF NOT EXISTS compliance_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            advisor_id INTEGER NOT NULL,
            client_id INTEGER NOT NULL,
            alert_type TEXT NOT NULL,
            severity TEXT DEFAULT 'medium',
            description TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP,
            FOREIGN KEY (advisor_id) REFERENCES users(id),
            FOREIGN KEY (client_id) REFERENCES clients(id)
        );
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            advisor_id INTEGER NOT NULL,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (advisor_id) REFERENCES users(id)
        );
    """)

    # Check if already seeded
    existing = cursor.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    if existing > 0:
        conn.close()
        print("✅ Database already initialized")
        return

    # Create advisor
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed = pwd_context.hash("advisor123")
    cursor.execute("""
        INSERT INTO users (username, email, hashed_password, full_name, role)
        VALUES (?, ?, ?, ?, ?)
    """, ("arjun.sharma", "arjun.sharma@wealthfirm.com", hashed, "Arjun Sharma", "advisor"))
    advisor_id = cursor.lastrowid

    # Indian and globally diverse client names
    clients_data = [
        ("Rajesh Mehta",        58, "rajesh.mehta@email.com",      "conservative", 8500000,  "UHNW",         "Retirement Planning, Business Sale Rs 6.2Cr", "2025-06-20"),
        ("Priya Sharma",        42, "priya.sharma@email.com",       "moderate",     3200000,  "HNW",          "Child Education Fund, Property Purchase",      "2025-07-15"),
        ("Arjun Nair",          35, "arjun.nair@email.com",         "aggressive",   1800000,  "HNW",          "Tech Startup Equity, ESOP Vesting",            "2025-08-01"),
        ("Sunita Patel",        65, "sunita.patel@email.com",       "conservative", 12000000, "UHNW",         "Estate Planning, Grandchildren Trust Fund",    "2025-05-30"),
        ("Vikram Reddy",        48, "vikram.reddy@email.com",       "moderate",     5600000,  "UHNW",         "Business Expansion, Second Property",          "2025-09-10"),
        ("Ananya Krishnan",     39, "ananya.krishnan@email.com",    "aggressive",   2100000,  "HNW",          "IPO Proceeds Rs 1.8Cr, Career Change",         "2025-07-22"),
        ("Deepak Joshi",        55, "deepak.joshi@email.com",       "moderate",     7800000,  "UHNW",         "Retirement in 5 Years, Daughter Marriage",     "2025-06-05"),
        ("Meera Iyer",          44, "meera.iyer@email.com",         "moderate",     4300000,  "HNW",          "Divorce Settlement, New Investment Strategy",  "2025-08-18"),
        ("Rahul Gupta",         31, "rahul.gupta@email.com",        "aggressive",   950000,   "Mass Affluent","First Home Purchase, SIP Planning",            "2025-10-01"),
        ("Kavitha Venkatesh",   61, "kavitha.v@email.com",          "conservative", 9200000,  "UHNW",         "Inheritance Rs 3Cr, Charitable Trust Setup",   "2025-06-30"),
    ]

    portfolio_templates = {
        "conservative": [("Equities", 0.30, 0.045), ("Fixed Income", 0.45, 0.062), ("Alternatives", 0.10, 0.031), ("Cash", 0.15, 0.021)],
        "moderate":     [("Equities", 0.55, 0.082), ("Fixed Income", 0.25, 0.055), ("Alternatives", 0.15, 0.071), ("Cash", 0.05, 0.021)],
        "aggressive":   [("Equities", 0.75, 0.124), ("Fixed Income", 0.10, 0.044), ("Alternatives", 0.12, 0.098), ("Cash", 0.03, 0.021)],
    }

    alert_templates = [
        ("rebalancing",  "high",   "Equity allocation has drifted 18% above target — immediate rebalancing required"),
        ("review_due",   "medium", "Annual review is overdue by 45 days — schedule client meeting immediately"),
        ("suitability",  "high",   "High-risk product held by Conservative profile client — suitability review needed"),
        ("kyc_expiry",   "low",    "KYC documents expiring in 30 days — request updated documents from client"),
        ("concentration","medium", "Single stock position exceeds 20% of portfolio — concentration risk alert"),
    ]

    for i, (name, age, email, risk, aum, segment, life_events, review_date) in enumerate(clients_data):
        cursor.execute("""
            INSERT INTO clients (advisor_id, name, age, email, phone, risk_profile, aum, segment, life_events, next_review_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (advisor_id, name, age, email, f"+91-98{random.randint(10000000,99999999)}", risk, aum, segment, life_events, review_date))
        client_id = cursor.lastrowid

        for asset_class, alloc_pct, ytd in portfolio_templates[risk]:
            value = aum * alloc_pct
            cursor.execute("""
                INSERT INTO portfolios (client_id, asset_class, allocation_pct, current_value, ytd_return, benchmark_return, last_rebalanced)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (client_id, asset_class, alloc_pct * 100, value, ytd, ytd - 0.01, "2025-01-15"))

        if i < 5:
            alert = alert_templates[i]
            cursor.execute("""
                INSERT INTO compliance_alerts (advisor_id, client_id, alert_type, severity, description, status)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (advisor_id, client_id, alert[0], alert[1], alert[2], "active"))

    conn.commit()
    conn.close()
    print("✅ Database initialized with 10 Indian clients seed data")

if __name__ == "__main__":
    init_db()
