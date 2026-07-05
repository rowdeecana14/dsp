# Development Dockerfile for the API container.
# The source is mounted from app/Api at runtime.

FROM node:24.15.0-slim
WORKDIR /usr/src/api

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates git \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@11

EXPOSE 3000
CMD ["sh", "-c", "cd /usr/src/api && if [ -f pnpm-lock.yaml ]; then pnpm approve-builds --all && pnpm install --trust-lockfile; elif [ -f package-lock.json ]; then npm install; elif [ -f package.json ]; then pnpm approve-builds --all && pnpm install --trust-lockfile; fi && npm run start:dev"]
