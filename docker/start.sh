#!/bin/sh

mkdir -p /app/data

export LFREADER_DB=/app/data/db.sqlite
export LFREADER_ARCHIVE=/app/data/archives

cd /app/backend
. venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 3000 2>&1 > /var/log/backend.log &

cd /app
caddy run
