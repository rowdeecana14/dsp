# Dental Platform — Cloud Deployment

Deploy the NestJS API and static OHIF dental viewer build to any cloud provider.

## Architecture

```
[Browser] → [CDN / static host] → OHIF viewer (dental.js)
                ↓ JWT
           [API host] → MySQL + Redis
```

DICOM images continue to load from configured DICOMweb sources (e.g. AWS CloudFront). Only viewer state and measurements hit your API.

## 1. Database

Provision **MySQL 8** and **Redis 7** (optional but recommended for rate limiting).

Run migrations once:

```bash
cd app/api
pnpm install
pnpm run migrate
pnpm run db:seed
```

## 2. API (NestJS)

### Required environment variables

Copy `app/api/.env.example` and set:

| Variable | Example |
|----------|---------|
| `DB_HOST` | your-mysql-host |
| `DB_PORT` | 3306 |
| `DB_USER` | dspuser |
| `DB_PASSWORD` | *** |
| `DB_DATABASE` | dsp |
| `JWT_SECRET` | long-random-string |
| `JWT_EXPIRATION_TIME` | 1d |
| `CORS_ORIGIN` | https://viewer.example.com |
| `PORT` | 3000 |

### Build & start

```bash
cd app/api
pnpm install
pnpm run build
pnpm run start:prod
```

Health check: `GET /api/v1/health`

Swagger: `/api/docs`

### Docker image (API only)

```bash
docker build -f docker/api/Dockerfile -t dsp-api .
docker run -p 3000:3000 --env-file app/api/.env dsp-api
```

## 3. Viewer (static build)

```bash
cd app/web/Viewers
pnpm install
REACT_APP_API_URL=https://api.example.com/api/v1 \
  APP_CONFIG=config/dental.js \
  pnpm run build
```

Artifacts: `platform/app/dist/`

Before building, set `dentalApiUrl` in `platform/app/public/config/dental.js` to your production API URL, or inject at build time.

Serve with nginx, Netlify, Vercel, S3+CloudFront, etc. Enable SPA fallback so `/login` and `/dental/*` routes resolve to `index.html`.

### Example nginx snippet

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## 4. Production Docker Compose

For a single-host deployment:

```bash
cd docker
cp .env.docker .env.prod   # edit secrets
docker compose -f docker-compose.prod.yml up -d --build
```

See [`docker/docker-compose.prod.yml`](../docker/docker-compose.prod.yml).

## 5. Provider quick notes

| Provider | API | Viewer |
|----------|-----|--------|
| **Railway** | Node service + MySQL plugin | Static site or separate service |
| **Render** | Web service + managed Postgres/MySQL | Static site |
| **Fly.io** | `fly launch` in `app/api` | Deploy `dist/` via Fly machines or CDN |
| **Netlify** | — | Drag `platform/app/dist`, set redirects for SPA |

## 6. Post-deploy checklist

- [ ] Login at `/login` works against production API
- [ ] CORS allows viewer origin
- [ ] `dentalApiUrl` points to production API
- [ ] Migrations applied; seed admin password rotated
- [ ] HTTPS on both viewer and API
