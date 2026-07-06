# Docker Development Setup

Docker Compose stack for the dental OHIF viewer, NestJS API, MySQL, and Redis.

## Quick start

```bash
cd docker
docker compose up --build
```

First run — initialize the database:

```bash
docker compose exec api pnpm run migrate && docker compose exec api pnpm run db:seed
```

| Service | URL |
|---------|-----|
| Viewer (Dental Mode) | http://localhost:8080 |
| API + Swagger | http://localhost:3000/api/docs |
| MySQL | localhost:3306 |
| Redis | localhost:6379 |

The web container automatically sets `APP_CONFIG=config/dental.js` and `REACT_APP_API_URL=http://localhost:3000/api/v1`. See [docs/SETUP_DENTAL.md](../docs/SETUP_DENTAL.md) for full dental setup.

## Services

| Service | Image / build | Source mount |
|---------|---------------|--------------|
| `mysql` | mysql:8.0 | Persistent volume `db_data` |
| `redis` | redis:7-alpine | Persistent volume `redis_data` |
| `api` | `docker/api/Dockerfile` | `../app/api` |
| `web` | `docker/web/Dockerfile` | `../app/web/Viewers` |

## Web container behavior

The web image uses **Node 24** and **pnpm 11.5.2** (`docker/web/Dockerfile`).

On startup (`docker/web/entrypoint.sh`):

1. Runs `pnpm install --frozen-lockfile` if `node_modules` is incomplete
2. Sets `APP_CONFIG=config/dental.js`
3. Starts `pnpm run dev` (OHIF dev server on port 3000, exposed as **8080** on the host)

Source under `app/web/Viewers` is bind-mounted — code changes hot-reload without rebuilding the image.

### Updating dependencies (lockfile)

After changing `package.json` in the dental extension, mode, or other workspace packages:

```bash
cd docker
docker compose run --rm --no-deps --entrypoint sh web \
  -c "cd /usr/src/web && pnpm install --no-frozen-lockfile"
```

Commit the updated `app/web/Viewers/pnpm-lock.yaml`, then:

```bash
docker compose restart web
```

## Common commands

```bash
# Start all services
docker compose up -d --build

# View logs
docker compose logs -f web
docker compose logs -f api

# Stop
docker compose down

# Rebuild web only
docker compose build web && docker compose up -d web
```

## Environment

Copy or edit `docker/.env.docker` for MySQL credentials and ports. Compose also reads `docker/.env` if present.

## Notes

- Development-only setup; not intended for production deployment.
- Requires `app/web/Viewers` and `app/api` source in the repo.
- Host Node version does not matter for Docker — installs run inside the Node 24 container.
- For local (non-Docker) development, see [docs/SETUP_DENTAL.md](../docs/SETUP_DENTAL.md).
