#!/bin/bash

echo "🚀 Starting Scout frontend (Vite) in the background..."
nohup npm run dev > scout-frontend.log 2>&1 &

echo "✅ Running in background. Logs → scout-frontend.log"
echo "🧪 Visit: http://localhost:5173"

