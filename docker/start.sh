#!/bin/sh

cd /app/backend
uvicorn app:app --host 0.0.0.0 --port 3000 &> /var/log/backend.log &
cd /app
caddy run
