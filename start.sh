#!/bin/bash
# =====================================================
# Advisor AI — Quick Start Script
# Run this from the project root: bash start.sh
# =====================================================

echo ""
echo "🤖 Starting Advisor AI..."
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+"
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

# Check .env
if [ ! -f "backend/.env" ]; then
    echo "⚠️  No .env file found in backend/"
    echo "Creating from template..."
    cp backend/.env.example backend/.env
    echo ""
    echo "👉 IMPORTANT: Open backend/.env and add your ANTHROPIC_API_KEY"
    echo "   Get a free key at: https://console.anthropic.com"
    echo ""
fi

# Setup backend venv if not exists
if [ ! -d "backend/venv" ]; then
    echo "📦 Setting up Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt -q
    echo "✅ Backend dependencies installed"
    cd ..
fi

# Setup frontend if not exists
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install --silent
    echo "✅ Frontend dependencies installed"
    cd ..
fi

echo ""
echo "🚀 Starting servers..."
echo ""

# Start backend in background
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

sleep 2

# Start frontend in background
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

sleep 2

echo ""
echo "=========================================="
echo "  ✅ Advisor AI is running!"
echo "=========================================="
echo ""
echo "  🌐 App:     http://localhost:5173"
echo "  📡 API:     http://localhost:8000"
echo "  📖 Docs:    http://localhost:8000/docs"
echo ""
echo "  Login:   james.kumar / advisor123"
echo ""
echo "  Press Ctrl+C to stop all servers"
echo "=========================================="
echo ""

# Wait and cleanup on exit
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
