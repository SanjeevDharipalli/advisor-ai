#!/bin/bash

# ============================================================
# Advisor AI — Mac Startup Script (Fixed)
# Run this from the advisor-ai-mac folder: bash start_mac.sh
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo ""
echo "🤖 Advisor AI — Starting up..."
echo "============================================================"

# Check Python
if ! command -v python3 &> /dev/null; then
  echo "❌ Python3 not found. Install from https://python.org"
  exit 1
fi
echo "✅ Python3 found"

# Check Node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org"
  exit 1
fi
echo "✅ Node.js found"

# Check/create .env
if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo ""
  echo "📝 Creating .env file from template..."
  cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
  echo ""
  echo "⚠️  ACTION REQUIRED:"
  echo "   1. Open the file: backend/.env  (in VS Code or any text editor)"
  echo "   2. Replace 'your_claude_api_key_here' with your real Anthropic API key"
  echo "      Get a free key at: https://console.anthropic.com → API Keys"
  echo ""
  read -p "   Press ENTER after you have saved your API key in backend/.env ..."
fi

if grep -q "your_claude_api_key_here" "$BACKEND_DIR/.env"; then
  echo ""
  echo "⚠️  WARNING: API key not set yet. AI chat won't work until you add it to backend/.env"
fi

# Setup Python venv
if [ ! -d "$BACKEND_DIR/venv" ]; then
  echo ""
  echo "🐍 Setting up Python virtual environment (first time only)..."
  cd "$BACKEND_DIR"
  python3 -m venv venv
  source venv/bin/activate
  pip install --upgrade pip -q
  echo "📦 Installing Python packages..."
  pip install -r requirements.txt
  deactivate
  cd "$SCRIPT_DIR"
  echo "✅ Python setup complete"
else
  echo "✅ Python venv already exists"
fi

# Setup frontend
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo ""
  echo "📦 Installing frontend packages (first time only)..."
  cd "$FRONTEND_DIR"
  npm install
  cd "$SCRIPT_DIR"
  echo "✅ Frontend packages installed"
else
  echo "✅ Frontend packages already installed"
fi

# Clear ports
echo ""
echo "🧹 Clearing ports 8000 and 5173 if in use..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 1

# Start Backend
echo ""
echo "============================================================"
echo "🚀 Starting Backend on http://localhost:8000 ..."
echo "============================================================"
cd "$BACKEND_DIR"
source venv/bin/activate
export $(grep -v '^#' .env | xargs) 2>/dev/null
python3 main.py &
BACKEND_PID=$!
cd "$SCRIPT_DIR"

sleep 3
if ! kill -0 $BACKEND_PID 2>/dev/null; then
  echo ""
  echo "❌ Backend failed to start."
  echo "   Fix: delete the backend/venv folder and run this script again."
  exit 1
fi
echo "✅ Backend running (PID $BACKEND_PID)"

# Start Frontend
echo ""
echo "============================================================"
echo "🚀 Starting Frontend on http://localhost:5173 ..."
echo "============================================================"
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!
cd "$SCRIPT_DIR"

sleep 2
echo ""
echo "============================================================"
echo "✅ Everything is running!"
echo ""
echo "   🌐 Open in browser:   http://localhost:5173"
echo "   👤 Username:          james.kumar"
echo "   🔑 Password:          advisor123"
echo "   📖 API docs:          http://localhost:8000/docs"
echo ""
echo "   Press CTRL+C to stop both servers"
echo "============================================================"
echo ""

trap "echo ''; echo '🛑 Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
