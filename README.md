# Dental SaaS Platform — OHIF Viewer

A customized [OHIF Viewer](https://github.com/OHIF/Viewers) for dental practices with **Dental Mode** UI, a **2×2 hanging protocol**, **dental measurement presets**, and a **NestJS backend** for authenticated state persistence.

## Repository Structure

```
dsp/
├── app/
│   ├── api/                 # NestJS backend (JWT auth, viewer state, measurements)
│   └── web/
│       └── Viewers/         # OHIF v3 fork with dental extension & mode
├── docker/                  # Docker Compose for local development
├── docs/
│   ├── SETUP_DENTAL.md      # Dental viewer setup, config, troubleshooting
│   └── DEMO_RECORDING.md    # Step-by-step demo video script
└── README.md
```

## Features

### Dental Mode UI (Frontend)

| Feature | Description |
|---------|-------------|
| **Dental theme toggle** | Clinical teal palette, typography, and icons |
| **Practice Header** | Practice name, patient info, tooth selector (FDI / Universal) |
| **2×2 Hanging Protocol** | Top-left: current image · Top-right: prior exam (same modality) · Bottom: bitewing placeholders |
| **Measurements Palette** | One-click presets: PA length, Canal angle, Crown width, Root length |
| **Measurements Panel** | Right panel with sort/filter and **Export JSON** |
| **Backend sync** | Persist viewer state and measurements (JWT required) |
| **Login gate** | Sign-in page enforces authentication before study list / viewer |

### Backend (`app/api`)

- `POST /api/v1/auth/login` — obtain JWT
- `GET/POST /api/v1/viewer-state` — mode, theme, tooth, layout
- `GET/POST/DELETE /api/v1/measurements` — dental measurements CRUD

## Quick Start

### Prerequisites

- Node.js ≥ 24
- pnpm 11
- Docker & Docker Compose (optional)

### Option A — Docker (recommended)

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

The viewer loads `config/dental.js` automatically (`APP_CONFIG=config/dental.js`). The web container mounts `app/web/Viewers` for live code changes.

See [docs/SETUP_DENTAL.md](docs/SETUP_DENTAL.md) for full setup, configuration, and troubleshooting.

### Option B — Local development

**Backend:**

```bash
cd app/api
pnpm install
cp .env.example .env   # if present
pnpm run migrate && pnpm run db:seed
pnpm run start:dev
```

**Viewer:**

```bash
cd app/web/Viewers
pnpm install
APP_CONFIG=config/dental.js pnpm run dev:dental
```

Open the port shown in the terminal (often http://localhost:3000).

## Authentication

The dental viewer **requires login** before accessing the study list or viewer.

1. Open http://localhost:8080 — you are redirected to `/login`.
2. Sign in with the seeded credentials:
   - **Email:** `admin@example.com`
   - **Password:** `change-me-strongly`
3. After login you can open studies, save measurements, and sync viewer state.

### API login (curl)

```bash
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"change-me-strongly"}' | jq .
```

The JWT is at **`json.data.token`** in the response body:

```json
{
  "statusCode": 200,
  "message": "Logged in successfully",
  "data": {
    "token": "eyJhbG...",
    "user": { "id": "...", "email": "admin@example.com", ... }
  }
}
```

The login page stores the token automatically. For manual testing in the browser console:

```js
// After curl, paste the token value:
localStorage.setItem('dental_auth_token', '<token>');
localStorage.setItem('dental_auth_user', JSON.stringify({ email: 'admin@example.com' }));
location.reload();
```

Use **Logout** in the practice header menu to sign out.

## Using Dental Mode

1. Sign in at `/login`.
2. Open the study list and select a study (or use a direct viewer URL with `StudyInstanceUIDs`).
3. **Dental Mode** is the default mode when using `config/dental.js`.
4. Toggle **Dental / Standard** theme in the practice header.
5. Select a tooth and numbering system (FDI / Universal).
6. Click **Measurements** → pick a preset → draw on the viewport.
7. Review measurements in the right panel; filter, sort, **Export JSON**, or **Save to Server**.

### Hanging Protocol Layout

```
┌─────────────────┬─────────────────┐
│  Current Image  │   Prior Exam    │
├─────────────────┼─────────────────┤
│ Bitewing Left   │ Bitewing Right  │
└─────────────────┴─────────────────┘
```

Protocol ID: `@ohif/hpDental2x2` (registered by `@ohif/extension-dental`).

For prior-exam comparison, open a study URL with two `StudyInstanceUIDs` (current first, prior second). The prior viewport matches the **same modality** as the current image.

## Verification Checklist

- [ ] `docker compose up` — viewer at :8080, API at :3000
- [ ] `/login` gate — unauthenticated users cannot access study list
- [ ] Practice header shows practice name, patient info, tooth selector
- [ ] Theme toggle switches dental teal palette
- [ ] 2×2 grid loads (top row images; bottom bitewing slots may be empty without bitewing DICOM)
- [ ] Measurements palette activates Length/Angle tools with dental labels
- [ ] Panel sort reorders the visible measurement list
- [ ] Export JSON downloads measurement file
- [ ] After login + tooth change → `GET /api/v1/viewer-state` returns saved state
- [ ] Logout returns to login page

## Demo Video

Record a ≤5 min walkthrough using the script in [docs/DEMO_RECORDING.md](docs/DEMO_RECORDING.md).

Suggested tool: OBS Studio or Loom.

## Deployment (Bonus)

Deploy the API to any Node host (Railway, Render, Fly.io) and the viewer as a static build:

```bash
cd app/web/Viewers
REACT_APP_API_URL=https://api.example.com/api/v1 APP_CONFIG=config/dental.js pnpm run build
# Serve platform/app/dist with nginx or CDN
```

## Customization

| Item | Location |
|------|----------|
| Practice name | `platform/app/public/config/dental.js` → `dentalPracticeName` |
| Measurement presets | `extensions/dental/src/modules/dental/store/measurementPresets.ts` |
| Hanging protocol | `extensions/dental/src/hangingprotocols/hpDental2x2.ts` |
| Dental mode | `modes/dental/src/index.ts` |
| Login page | `extensions/dental/src/modules/auth/components/DentalLoginPage.tsx` |
| API URL | `dentalApiUrl` in `config/dental.js` |
| Full setup guide | [docs/SETUP_DENTAL.md](docs/SETUP_DENTAL.md) |

## License

OHIF components: MIT (see upstream [OHIF/Viewers](https://github.com/OHIF/Viewers)). Dental customization: MIT.
