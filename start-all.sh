#!/bin/bash
echo "Starting Resume AI Assistant..."

# Start backend
cd backend
source venv/bin/activate
export $(cat .env | xargs)
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "Backend started (PID $BACKEND_PID) → http://localhost:8000"

# Start frontend
cd ../frontend
npm start &
FRONTEND_PID=$!
echo "Frontend started (PID $FRONTEND_PID) → http://localhost:3000"

echo ""
echo "App is running! Open http://localhost:3000 in your browser."
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID" INT
wait
