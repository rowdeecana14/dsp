# Dental SaaS Platform — OHIF Viewer

A customized [OHIF Viewer](https://github.com/OHIF/Viewers) for dental practices with **Dental Mode** UI, a **2×2 hanging protocol**, **dental measurement presets**, and a **NestJS backend** for authenticated state persistence.

## Repository Structure

```
dsp/
├── app/
│   ├── Api/                 # NestJS backend (JWT auth, viewer state, measurements)
│   └── web/
│       └── Viewers/         # OHIF v3 fork with dental extension & mode
├── docker/                  # Docker Compose for local development
└── README.md
```

## Features

### Dental Mode UI (Frontend)

| Feature | Description |
|---------|-------------|
| **Dental theme toggle** | Clinical teal palette, typography, and icons |
| **Practice Header** | Practice name, patient info, tooth selector (FDI / Universal) |
| **2×2 Hanging Protocol** | Top-left: current image · Top-right: prior exam · Bottom: bitewing placeholders |
| **Measurements Palette** | One-click presets: PA length, Canal angle, Crown width, Root length |
| **Measurements Panel** | Right panel with sort/filter and **Export JSON** |
| **Backend sync** | Persist viewer state and measurements (JWT required) |

### Backend (`app/Api`)

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
cp .env.docker .env.docker   # adjust if needed
docker compose up --build
```

| Service | URL |
|---------|-----|
| Viewer (Dental Mode) | http://localhost:8080 |
| API + Swagger | http://localhost:3000/api/docs |

The viewer loads `config/dental.js` automatically (`APP_CONFIG=config/dental.js`).

### Option B — Local development

**Backend:**

```bash
cd app/Api
pnpm install
cp .env.example .env
pnpm run start:dev
```

**Viewer:**

```bash
cd app/web/Viewers
pnpm install
APP_CONFIG=config/dental.js pnpm run dev
```

Open http://localhost:3000 (or the port shown in the terminal).

### Authentication (backend sync)

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

Store the returned token in the browser:

```js
localStorage.setItem('dental_auth_token', '<token>');
```

Then use **Save to Server** in the measurements panel or change tooth/theme (auto-persisted when a study is open).

## Using Dental Mode

1. Open the study list and select a study (or use a direct viewer URL with `StudyInstanceUIDs`).
2. Choose **Dental Mode** from the mode selector (default when using `config/dental.js`).
3. Toggle **Dental Mode** theme in the practice header.
4. Select a tooth and numbering system (FDI / Universal).
5. Click **Measurements** → pick a preset → draw on the viewport.
6. Review measurements in the right panel; filter, sort, **Export JSON**, or **Save to Server**.

### Hanging Protocol Layout

```
┌─────────────────┬─────────────────┐
│  Current Image  │   Prior Exam    │
├─────────────────┼─────────────────┤
│ Bitewing Left   │ Bitewing Right  │
└─────────────────┴─────────────────┘
```

Protocol ID: `@ohif/hpDental2x2` (registered by `@ohif/extension-dental`).

## Demo Video

Record a ≤5 min walkthrough covering:

1. Study load and Dental Mode selection  
2. Practice header (patient, tooth selector, theme)  
3. 2×2 layout with current / prior / bitewing viewports  
4. Measurements palette → draw → panel → Export JSON  
5. Login + Save to Server (optional)

Suggested tool: OBS Studio or Loom.

## Deployment (Bonus)

Deploy the API to any Node host (Railway, Render, Fly.io) and the viewer as a static build:

```bash
cd app/web/Viewers
APP_CONFIG=config/dental.js pnpm run build
# Serve platform/app/dist with nginx or CDN
```

Set `REACT_APP_API_URL` to your API base (e.g. `https://api.example.com/api/v1`) before building.

## Customization

| Item | Location |
|------|----------|
| Practice name | `config/dental.js` → `dentalPracticeName` |
| Measurement presets | `extensions/dental/src/components/MeasurementsPalette.tsx` |
| Hanging protocol | `extensions/dental/src/hangingprotocols/hpDental2x2.ts` |
| Dental mode | `modes/dental/src/index.ts` |
| API URL | `REACT_APP_API_URL` env var |

## License

OHIF components: MIT (see upstream [OHIF/Viewers](https://github.com/OHIF/Viewers)). Dental customization: MIT.
