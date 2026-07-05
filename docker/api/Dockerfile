# Development Dockerfile for the API container.
# The source is mounted from app/api at runtime.

FROM node:24.15.0-slim
WORKDIR /usr/src/api

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates git \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@11

EXPOSE 3000
CMD ["sh", "-c", "cd /usr/src/api && if [ ! -d node_modules/@nestjs/typeorm/dist/common ]; then rm -rf node_modules && pnpm install; fi && npm run start:dev"]
