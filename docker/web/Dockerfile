# Development Dockerfile for the frontend container.
# The source is mounted from app/Viewers at runtime.

FROM node:24.15.0-slim
WORKDIR /usr/src/web

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates git \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@11.5.2 --activate

WORKDIR /usr/src/web
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3000
CMD ["/usr/local/bin/entrypoint.sh"]
