#!/bin/sh

export YAFR_DB=/app/data/db.sqlite
export YAFR_NO_OPENAPI=1

mkdir -p /app/data

cd /app/backend
uvicorn app:app --host 0.0.0.0 --port 3000 &> /var/log/backend.log &
cd /app
caddy run
