#!/bin/sh

mkdir -p /app/data /app/logs

cd /app/backend
. venv/bin/activate
uvicorn lfreader_server.app:app --host 0.0.0.0 --port 3000 > /app/logs/backend.log 2>&1 &

cd /app
caddy run
