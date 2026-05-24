# 🤖 Advisor AI — Mac Setup Guide

## Quick Start (Easiest Way)

```bash
# 1. Open Terminal, navigate to this folder
cd ~/Downloads/advisor-ai-mac

# 2. Run the startup script
bash start_mac.sh
```

That's it! The script handles everything automatically.

---

## Login
- **URL:** http://localhost:5173
- **Username:** james.kumar
- **Password:** advisor123

---

## If you ran the old version and got errors — do this first

Delete the broken venv so it gets rebuilt with the fixed packages:

```bash
cd ~/Downloads/advisor-ai-mac/backend
rm -rf venv
cd ..
bash start_mac.sh
```

---

## Manual setup (VS Code two-terminal method)

### Step 1 — Get your Anthropic API key
Go to https://console.anthropic.com → Sign up free → API Keys → Create key → Copy it

### Step 2 — Set up your .env
```bash
cd backend
cp .env.example .env
# Open backend/.env in VS Code and replace 'your_claude_api_key_here' with your real key
```

### Step 3 — Terminal 1: Start the Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py
```
✅ You should see: `Uvicorn running on http://0.0.0.0:8000`
Leave this terminal open and running.

### Step 4 — Terminal 2: Start the Frontend
Open a NEW terminal (don't close Terminal 1), then:
```bash
cd frontend
npm install
npm run dev
```
✅ You should see: `Local: http://localhost:5173/`
Leave this terminal open too.

### Step 5 — Open the app
Go to http://localhost:5173 in your browser.

---

## Common Errors & Fixes

| Error | Fix |
|---|---|
| `pydantic-core` build fails | Delete `backend/venv` folder and re-run `bash start_mac.sh` |
| `Unexpected "Last" in JSON` | Fixed in vite.config.js — make sure you use this new zip |
| `ModuleNotFoundError: No module named 'fastapi'` | venv not activated — use `bash start_mac.sh` instead of running manually |
| Blank page at localhost:5173 | Backend not running — check Terminal 1 |
| AI chat says "API key not configured" | Edit `backend/.env` and add your Anthropic key |
| Port already in use | Run: `lsof -ti:8000 \| xargs kill -9` and `lsof -ti:5173 \| xargs kill -9` |
