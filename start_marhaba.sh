#!/bin/bash
echo "Killing previous backend on port 8000..."
fuser -k 8000/tcp || true

echo "Starting Marhaba_Software backend..."
cd /home/ibaa/Softwares/Marhaba_Software/Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > uvicorn.log 2>&1 &
echo "Started! The swagger UI will be at http://localhost:8000/docs"
