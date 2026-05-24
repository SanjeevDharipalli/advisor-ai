# 🤖 Advisor AI — Intelligent Agent

> An AI-powered concierge for financial advisors at broker-dealer firms.  
> Built as a mini-project submission by a fresher/intern.

---

## 📌 Problem Statement

Financial advisors operate in a fragmented ecosystem — client data, portfolios, compliance rules, and market insights are spread across multiple systems. This leads to delayed responses, missed revenue, and compliance risks.

**Advisor AI** solves this by providing a real-time, conversational AI assistant that gives advisors instant access to their entire book of business.

---

## 🎯 Features

| Module | What it does |
|---|---|
| 🤖 **AI Concierge** | Chat with Claude AI — ask anything about clients, portfolios, risks in plain English |
| 📊 **Dashboard** | Real-time KPIs — AUM, compliance score, alerts, revenue opportunities |
| 👥 **Clients** | Full client book with search, filter, segment, risk profile |
| 👤 **Client 360** | Deep dive — portfolio breakdown, life events, next best actions |
| 💹 **Portfolio** | Book-wide performance, alpha vs benchmark, rebalancing queue |
| 🛡️ **Compliance** | Active alerts, resolve alerts, real-time pre-trade checker |

---

## 🏗️ Architecture

```
advisor-ai/
├── backend/               ← Python FastAPI
│   ├── main.py            ← App entry point
│   ├── database.py        ← SQLite + seed data
│   ├── routes/
│   │   ├── auth.py        ← JWT login/auth
│   │   ├── chat.py        ← Claude AI integration
│   │   ├── portfolio.py   ← Portfolio analytics
│   │   ├── clients.py     ← Client management + insights
│   │   └── compliance.py  ← Alerts + pre-trade checks
│   └── requirements.txt
│
├── frontend/              ← React + Vite
│   ├── src/
│   │   ├── App.jsx        ← Router setup
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Chat.jsx        ← Real AI chat
│   │   │   ├── Clients.jsx
│   │   │   ├── ClientDetail.jsx
│   │   │   ├── Portfolio.jsx
│   │   │   └── Compliance.jsx
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   ├── services/
│   │   │   └── api.js     ← All API calls
│   │   └── hooks/
│   │       └── useAuth.jsx
│   └── package.json
│
└── README.md
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Recharts, React Router |
| Backend | Python 3.11+, FastAPI, Uvicorn |
| AI / LLM | Claude (Anthropic API) via RAG-style context injection |
| Database | SQLite (local, zero setup) |
| Auth | JWT (python-jose) + bcrypt |
| HTTP | Axios (frontend), HTTPX (backend) |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- An Anthropic API key (free at [console.anthropic.com](https://console.anthropic.com))

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/advisor-ai.git
cd advisor-ai
```

---

### Step 2 — Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

Now open `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
```

Start the backend:
```bash
python main.py
```

Backend runs at: **http://localhost:8000**  
API docs at: **http://localhost:8000/docs** (Swagger UI — auto-generated!)

---

### Step 3 — Frontend setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the app
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### Step 4 — Login

Open **http://localhost:5173** in your browser.

```
Username: james.kumar
Password: advisor123
```

---

## 🧠 How the AI Works

The AI Chat uses **Claude by Anthropic** with a technique called **context injection** (similar to RAG):

1. When you send a message, the backend **fetches real data** from the database (your clients, portfolios, compliance alerts)
2. This data is **injected into the system prompt** sent to Claude
3. Claude answers based on your actual client data — not generic responses
4. The full conversation history is maintained per session

This means when you ask *"What are the top risks in my book?"*, Claude actually analyzes your 10 real clients and gives a data-backed answer.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/chat/message` | Send message to AI |
| GET | `/api/portfolio/summary` | Book-wide portfolio summary |
| GET | `/api/clients/` | List all clients (with filters) |
| GET | `/api/clients/{id}` | Client 360 view |
| GET | `/api/clients/insights/life-events` | Clients with life events |
| GET | `/api/clients/insights/revenue-opportunities` | Cross-sell/upsell opps |
| GET | `/api/compliance/alerts` | All compliance alerts |
| POST | `/api/compliance/resolve/{id}` | Resolve an alert |
| GET | `/api/compliance/pretrade-check/{id}` | Pre-trade compliance check |

---

## 🧪 Sample AI Questions to Try

- *"Summarize my client portfolio performance today"*
- *"What are the top risks in my book?"*
- *"Prepare a client 360 summary for Sarah Chen"*
- *"Which clients need rebalancing?"*
- *"What are my cross-sell and upsell opportunities?"*
- *"Run a compliance check — any violations?"*
- *"Show me clients with life events detected recently"*
- *"Who are my top performing clients this year?"*

---

## 📈 Future Enhancements (Phase 3 & 4 from Problem Statement)

- **Voice interface** — Speech-to-text + text-to-speech
- **AWS deployment** — Deploy to EC2/ECS with RDS (PostgreSQL)
- **Real CRM integration** — Salesforce, Redtail
- **Streaming responses** — Real-time token streaming from Claude
- **Market data feeds** — Live prices via Alpha Vantage / Yahoo Finance
- **RAG with vector DB** — Store research reports in OpenSearch/Pinecone
- **Autonomous agents** — Auto-trigger rebalancing proposals

---

## 👤 Author

Built as a fresher/intern mini-project submission.  
Stack chosen for simplicity, readability, and real-world relevance.

---

## 📄 License

MIT License — free to use and modify.
