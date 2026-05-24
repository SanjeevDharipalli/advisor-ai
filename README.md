# 🤖 Advisor AI — Intelligent Financial Advisor Concierge

> A full-stack AI-powered web application that acts as a real-time intelligent assistant for financial advisors at broker-dealer firms.

---

## 📌 Problem Statement

Financial advisors operate in a fragmented ecosystem — client data, portfolios, compliance rules, and market insights are spread across multiple systems. This leads to:

- Delayed client responses
- Missed revenue opportunities
- Inconsistent compliance adherence
- High dependency on manual workflows

**Advisor AI** solves this by providing a conversational AI assistant that gives advisors instant, data-driven answers about their entire book of business.

---

## 🎯 Features

| Module | What it does |
|---|---|
| 🤖 **AI Concierge** | Ask anything in plain English — get instant data-backed answers |
| 📊 **Dashboard** | Live KPIs — Total AUM, compliance score, alerts, opportunities |
| 👥 **Clients** | Full client book with search, filter, segment, risk profile |
| 👤 **Client 360** | Individual deep dive — portfolio, life events, next best actions |
| 💹 **Portfolio** | Book-wide performance, alpha vs benchmark, rebalancing queue |
| 🛡️ **Compliance** | Active alerts with severity levels and pre-trade compliance checker |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 + React Router |
| Backend | Python FastAPI + Uvicorn |
| AI Model | Groq API — LLaMA 3.3 70B (Free tier) |
| Database | SQLite — zero setup required |
| Auth | JWT tokens + bcrypt password hashing |
| AI Technique | RAG-style context injection |

---

## 📁 Project Structureadvisor-ai/
├── backend/
│   ├── main.py            ← FastAPI app entry point
│   ├── database.py        ← SQLite setup + 10 Indian client seed data
│   ├── requirements.txt   ← Python dependencies
│   ├── .env.example       ← Environment variables template
│   └── routes/
│       ├── auth.py        ← JWT login and authentication
│       ├── chat.py        ← AI chat using Groq API
│       ├── clients.py     ← Client management and insights
│       ├── portfolio.py   ← Portfolio analytics
│       └── compliance.py  ← Alerts and pre-trade checks
│
└── frontend/
└── src/
├── pages/         ← Dashboard, Chat, Clients, Portfolio, Compliance
├── components/    ← Layout and sidebar
├── services/      ← All API calls
└── hooks/         ← Auth state management---

## 🚀 Getting Started

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher
- Free Groq API key from [console.groq.com](https://console.groq.com)

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/SanjeevDharipalli/advisor-ai.git
cd advisor-ai
```

---

### Step 2 — Set up your API key

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and add your Groq API key:GROQ_API_KEY=gsk_your_key_here
SECRET_KEY=advisor-ai-secret-123Get a free key at [console.groq.com](https://console.groq.com) — no credit card needed.

---

### Step 3 — Start the Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate it
# Mac/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
python3 main.py
```

Backend runs at: **http://localhost:8000**
API docs at: **http://localhost:8000/docs**

---

### Step 4 — Start the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### Step 5 — Login

Open **http://localhost:5173** in your browser.Username: arjun.sharma
Password: advisor123
---

## 🧠 How the AI Works

The AI uses **RAG-style context injection**:

1. You send a message in the chat
2. Backend **fetches live data** from the database — clients, portfolios, compliance alerts
3. This data is **injected into the prompt** sent to Groq's LLaMA 3.3 model
4. The AI answers based on your **actual client data** — not generic responses
5. Conversation history is saved per session

When you ask *"Which clients need rebalancing?"* — the AI reads all 10 real client portfolios and gives a specific, data-backed answer.

---## 💬 Sample AI Questions

- *"Summarize my client portfolio performance today"*
- *"What are the top risks in my book?"*
- *"Which clients need rebalancing?"*---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user info |
| POST | `/api/chat/message` | Send message to AI |
| GET | `/api/portfolio/summary` | Book-wide portfolio summary |
| GET | `/api/clients/` | List all clients |
| GET | `/api/clients/{id}` | Client 360 view |
| GET | `/api/compliance/alerts` | All compliance alerts |
| POST | `/api/compliance/resolve/{id}` | Resolve an alert |
| GET | `/api/compliance/pretrade-check/{id}` | Pre-trade compliance check |

---## 👥 Seed Data

The database is automatically seeded with **10 realistic Indian client profiles**:

- **UHNW clients** — Rajesh Mehta, Sunita Patel, Vikram Reddy, Deepak Joshi, Kavitha Venkatesh
- **HNW clients** — Priya Sharma, Arjun Nair, Ananya Krishnan, Meera Iyer
- **Mass Affluent** — Rahul Gupta

Across Conservative, Moderate, and Aggressive risk profiles with real life events like business sales, retirement planning, and inheritance.

---## 📈 Future Roadmap

- Voice interface — Speech-to-text in the chat
- AWS deployment — EC2 backend, S3 frontend, RDS database
- Real CRM integration — Salesforce API
- Streaming AI responses — Word by word like ChatGPT
- Vector database — OpenSearch for research document search
- Live market data — Real portfolio prices via financial APIs

---## 👤 Author

Built as a fresher/intern mini-project submission for the Advisor AI — Intelligent Agent problem statement.

Stack chosen for modern architecture, real-world relevance, and clean separation of concerns.
