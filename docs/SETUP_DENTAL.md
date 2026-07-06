# Dental Viewer Setup Guide

This guide covers how to run, configure, and verify the OHIF dental viewer in this repository.

## Overview

The dental stack consists of:

| Layer | Package / path | Role |
|-------|----------------|------|
| **Viewer app** | `app/web/Viewers/platform/app` | OHIF shell, routing, build |
| **Dental extension** | `app/web/Viewers/extensions/dental` (`@ohif/extension-dental`) | UI, hanging protocol, measurements, auth |
| **Dental mode** | `app/web/Viewers/modes/dental` (`@ohif/mode-dental`) | Workflow, toolbar, layout wiring |
| **App config** | `app/web/Viewers/platform/app/public/config/dental.js` | Runtime settings (auth, data sources, modes) |
| **Plugin registry** | `app/web/Viewers/platform/app/pluginConfig.json` | Registers extension + mode at build time |
| **API** | `app/api` | NestJS backend (JWT, viewer state, measurements) |

When `APP_CONFIG=config/dental.js` is active:

- **Dental Mode** is the default visible mode.
- Users must sign in at `/login` before accessing the study list or viewer.
- Viewer state and measurements sync to the NestJS API when authenticated.

## Prerequisites

- **Node.js** ≥ 24
- **pnpm** 11
- **Docker & Docker Compose** (optional, recommended for full stack)

## First-time install

From the OHIF monorepo root:

```bash
cd app/web/Viewers
pnpm install
```

This links workspace packages including `@ohif/extension-dental` and `@ohif/mode-dental` (33 workspace projects total). Plugin imports are regenerated on the first `dev` or `build` run from `pluginConfig.json`.

> **Lockfile:** `pnpm-lock.yaml` must include `extensions/dental` and `modes/dental`. If you add or change dependencies in those packages, regenerate the lockfile (see [Lockfile maintenance](#lockfile-maintenance) below).

**Backend** (local development):

```bash
cd app/api
pnpm install
cp .env.example .env   # if present
pnpm run migrate && pnpm run db:seed
```

## Option A — Docker (recommended)

```bash
cd docker
docker compose up --build
```

On first run, initialize the database:

```bash
docker compose exec api pnpm run migrate && docker compose exec api pnpm run db:seed
```

| Service | URL |
|---------|-----|
| Viewer (Dental Mode) | http://localhost:8080 |
| API + Swagger | http://localhost:3000/api/docs |

The web container (`docker/web/entrypoint.sh`) sets:

- `APP_CONFIG=config/dental.js`
- `REACT_APP_API_URL=http://localhost:3000/api/v1`

The viewer source is bind-mounted from `app/web/Viewers` for live code changes.

On first start the web container runs `pnpm install --frozen-lockfile` (Node 24, pnpm 11.5.2). Supply-chain verification on the lockfile can take ~1 minute.

### Lockfile maintenance

If you see:

```
[ERR_PNPM_OUTDATED_LOCKFILE] Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with extensions/dental/package.json
```

Regenerate the lockfile **inside the web container** (Node 24 + pnpm 11 are required; local Node 20 will not work):

```bash
cd docker
docker compose run --rm --no-deps --entrypoint sh web \
  -c "cd /usr/src/web && pnpm install --no-frozen-lockfile"
```

Then commit the updated `app/web/Viewers/pnpm-lock.yaml` on the host (the Viewers directory is bind-mounted, so changes persist).

Verify frozen install:

```bash
docker compose run --rm --no-deps --entrypoint sh web \
  -c "cd /usr/src/web && pnpm install --frozen-lockfile"
```

Restart the web service after updating the lockfile:

```bash
docker compose restart web
```

## Option B — Local development

**Terminal 1 — API:**

```bash
cd app/api
pnpm run start:dev
```

**Terminal 2 — Viewer:**

```bash
cd app/web/Viewers
APP_CONFIG=config/dental.js pnpm run dev:dental
```

Or from the monorepo root:

```bash
cd app/web/Viewers
pnpm run dev   # uses default config unless APP_CONFIG is set
```

Use `dev:dental` to always load the dental config. Open the port printed in the terminal (often http://localhost:3000).

## Production build

```bash
cd app/web/Viewers
APP_CONFIG=config/dental.js pnpm run build
# Serve platform/app/dist with nginx or a CDN
```

Set `dentalApiUrl` in `config/dental.js` (or your deployment config) to point at the production API before building.

## Configuration reference

Primary config file:

`app/web/Viewers/platform/app/public/config/dental.js`

| Key | Purpose | Default |
|-----|---------|---------|
| `dentalPracticeName` | Shown in practice header and login page | `Bright Smile Dental` |
| `dentalApiUrl` | NestJS API base URL (enables auth + sync) | `http://localhost:3000/api/v1` |
| `customizationService` | Loads dental auth routes, hotkeys, and theme | See config file |
| `defaultDataSourceName` | DICOMweb source for study list | `ohif` (AWS S3 static WADO) |
| `modesConfiguration` | Hides non-dental modes; shows `@ohif/mode-dental` | See config file |

### Plugin registration

Both packages must appear in `platform/app/pluginConfig.json`:

```json
{ "packageName": "@ohif/extension-dental", "version": "3.0.0" }
{ "packageName": "@ohif/mode-dental", "version": "3.0.0" }
```

### Customization modules

`dental.js` loads:

- `@ohif/extension-dental.customizationModule.dental` — hotkeys (e.g. export measurements)
- `@ohif/extension-dental.customizationModule.dentalAuth` — `/login` route, logout menu item
- `@ohif/extension-default.customizationModule.theme` — theme system (`dental` preset in ui-next)

### Data sources

The default config includes:

1. **ohif** — AWS S3 static DICOMweb (public demo studies)
2. **local5000** — local WADO at `http://localhost:5000/dicomweb`

To use a local PACS, add or switch `defaultDataSourceName` and update `dataSources` in `dental.js`.

## Authentication

The dental viewer requires login when `dentalApiUrl` is set and OIDC is not configured.

**Seeded credentials** (after `db:seed`):

| Field | Value |
|-------|-------|
| Email | `admin@example.com` |
| Password | `change-me-strongly` |

**Flow:**

1. Open the viewer → redirected to `/login`
2. Sign in → JWT stored in `localStorage` (`dental_auth_token`)
3. Private routes (study list, viewer) become accessible
4. **Logout** via the practice header menu

**API login (curl):**

```bash
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"change-me-strongly"}' | jq .
```

Token path in response: `data.token`.

> **Note:** The dental JWT is used only for the NestJS API. It is **not** sent to public DICOMweb endpoints (avoids CORS preflight failures on CloudFront).

## Using Dental Mode

1. Sign in at `/login`.
2. Open the study list and select a study (or use a URL with `StudyInstanceUIDs`).
3. Dental Mode opens with the custom layout and 2×2 hanging protocol.
4. Use the **Dental / Standard** theme toggle in the practice header.
5. Select a tooth and numbering system (FDI / Universal).
6. Click **Measurements** → choose a preset → draw on the viewport.
7. Review measurements in the right panel; filter, sort, **Export JSON**, or save to the server.

### Hanging protocol (`@ohif/hpDental2x2`)

```
┌─────────────────┬─────────────────┐
│  Current Image  │   Prior Exam    │
├─────────────────┼─────────────────┤
│ Bitewing Left   │ Bitewing Right  │
└─────────────────┴─────────────────┘
```

For prior-exam comparison, pass two `StudyInstanceUIDs` in the URL (current first, prior second). The prior viewport matches the **same modality** as the current image.

## Architecture (extension layout)

```
extensions/dental/src/
├── app/              # OHIF module registration, layouts, providers
├── modules/
│   ├── auth/         # Login page, JWT bootstrap
│   ├── dental/       # Practice header, tooth selector, presets
│   ├── measurements/ # Panel, API sync, persistence
│   ├── viewer/       # Viewport placeholders, viewer-state sync
│   ├── patients/     # Patient strip
│   └── studies/      # Study sync orchestration
└── shared/           # API client, types, utilities
```

## Customization map

| Item | Location |
|------|----------|
| Practice name | `platform/app/public/config/dental.js` → `dentalPracticeName` |
| API URL | `platform/app/public/config/dental.js` → `dentalApiUrl` |
| Measurement presets | `extensions/dental/src/modules/dental/store/measurementPresets.ts` |
| Hanging protocol | `extensions/dental/src/hangingprotocols/hpDental2x2.ts` |
| Dental mode | `modes/dental/src/index.ts` |
| Login page | `extensions/dental/src/modules/auth/components/DentalLoginPage.tsx` |
| Dental theme | `platform/ui-next/src/themes/dental.json` |
| Toolbar / tools | `modes/dental/src/toolbarButtons.ts`, `initToolGroups.ts` |

## Verification checklist

- [ ] `docker compose up` — viewer at :8080, API at :3000
- [ ] `/login` gate — unauthenticated users cannot access study list
- [ ] Practice header shows practice name, patient info, tooth selector
- [ ] Theme toggle switches dental teal palette
- [ ] 2×2 grid loads (bottom bitewing slots may be empty without bitewing DICOM)
- [ ] Measurements palette activates Length/Angle tools with dental labels
- [ ] Panel sort reorders the visible measurement list
- [ ] Export JSON downloads measurement file
- [ ] After login + tooth change → `GET /api/v1/viewer-state` returns saved state
- [ ] Logout returns to login page

## Troubleshooting

### Study list fails after login (CORS / network error)

The dental JWT must not be attached to DICOMweb requests. If you see failures against `cloudfront.net`, confirm `authApi.ts` returns an empty `getAuthorizationHeader` for DICOMweb and that auth bootstrap ran (check `dentalApiUrl` is set in config).

### Dental mode not listed

1. Confirm `@ohif/mode-dental` is in `pluginConfig.json`.
2. Run `pnpm install` in `app/web/Viewers`.
3. Restart dev server so plugin imports regenerate.

### Auth redirect loop

1. Confirm `dentalApiUrl` is set in `dental.js`.
2. Confirm `@ohif/extension-dental.customizationModule.dentalAuth` is in `customizationService`.
3. Clear `localStorage` keys `dental_auth_token` and `dental_auth_user`, then sign in again.

### API sync not working

1. API running on the host/port matching `dentalApiUrl`.
2. Valid JWT in `localStorage` (`dental_auth_token`).
3. Database migrated and seeded.

### `ERR_PNPM_OUTDATED_LOCKFILE` on container start

The web entrypoint uses `pnpm install --frozen-lockfile`. After adding `@ohif/extension-dental`, `@ohif/mode-dental`, or changing their `package.json` dependencies, update the lockfile inside the web container (see [Lockfile maintenance](#lockfile-maintenance)).

If `node_modules` already exists from a partial install, the entrypoint may skip install and still start the dev server — but CI and fresh containers will fail until the lockfile is committed.

### Local `pnpm install` fails (Node too old)

The OHIF monorepo requires **Node.js ≥ 24** and **pnpm 11**. If your host has Node 20, use Docker for installs or upgrade Node before running `pnpm install` locally.

## Related docs

- [README.md](../README.md) — project overview and quick start
- [DEMO_RECORDING.md](./DEMO_RECORDING.md) — demo video walkthrough script
