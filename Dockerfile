FROM docker.io/node:latest AS frontend-build
COPY frontend /app/frontend
RUN cd /app/frontend && npm ci && npm run build

FROM docker.io/alpine:latest
LABEL MAINTAINER="DCsunset"
COPY backend /app/backend

RUN apk add --no-cache caddy python3
RUN cd /app/backend && python3 -m venv ./venv && ./venv/bin/pip install -r requirements.txt

COPY docker/config.json /app/config.json
COPY docker/start.sh /app/start.sh
COPY docker/Caddyfile /app/Caddyfile
COPY --from=frontend-build /app/frontend/dist /app/frontend

ENV LFREADER_CONFIG=/app/config.json

EXPOSE 80
WORKDIR /app

CMD ["/app/start.sh"]
