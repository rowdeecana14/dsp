# Development Dockerfile for the frontend container.

FROM node:24.15.0-slim
WORKDIR /usr/src/web

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates git \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@11.5.2 --activate

COPY app/web/Viewers/ /usr/src/web/
COPY docker/web/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3000
CMD ["/usr/local/bin/entrypoint.sh"]
