FROM docker.io/node:latest AS frontend-build
COPY frontend /app/frontend
RUN cd /app/frontend && npm ci && npm run build

FROM docker.io/alpine:latest
COPY backend /app/backend
RUN apk add --no-cache caddy py3-pip && cd /app/backend && pip install -r requirements.txt
LABEL MAINTAINER="DCsunset"

COPY docker/start.sh /app/start.sh
COPY docker/Caddyfile /app/Caddyfile
COPY --from=frontend-build /app/frontend/dist /app/frontend

EXPOSE 80
WORKDIR /app/data

CMD ["./start.sh"]
