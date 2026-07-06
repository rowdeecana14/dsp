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

Use `dev:dental` to always load the dental config. The viewer dev server runs on **http://localhost:3001** (`OHIF_PORT=3001`) so it does not conflict with the NestJS API on port 3000. Open the URL printed in the terminal.

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
| `defaultWorkflowModeId` | Pre-selects launch workflow in the study list preview | `@ohif/mode-dental` |
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

### `modesConfiguration` and dental mode visibility

`dental.js` uses OHIF’s immutability-helper syntax to show dental mode and hide others:

```js
modesConfiguration: {
  '@ohif/mode-dental': {
    hide: { $set: false },
    isValidMode: {
      $set: () => ({ valid: true, description: 'Dental mode available for all studies' }),
    },
  },
  '@ohif/mode-longitudinal': { hide: { $set: true } },
  '@ohif/mode-basic': { hide: { $set: true } },
},
```

These patches must be applied with `update(modeInstance, modeConfiguration)` inside `modes/dental/src/index.ts` — **not** spread onto the mode object (`...modeConfiguration`). Spreading leaves `hide` as the object `{ $set: false }`, which is truthy, so OHIF treats dental mode as hidden and it never appears in the study list.

### Theme and appearance

| Piece | Location | Notes |
|-------|----------|-------|
| Dental preset tokens | `platform/ui-next/src/themes/dental.json`, `themes.css` | Dark clinical teal palette (suited to imaging chrome) |
| Theme provider registration | `extensions/dental/src/index.ts` | Registers `ActiveThemeProvider` whenever the dental extension loads |
| Provider tree order | `platform/app/src/App.tsx` | `ActiveThemeProvider` must wrap `ModalProvider` so **Appearance** can call `useActiveTheme()` |
| In-viewer toggle | Practice header → **Dental / Standard** | Persists to `localStorage` key `ohif:theme` |
| Appearance menu | Header gear → **Appearance** | Lists all presets including **Tonal: Dental Clinical** |

The dental extension’s UI (`ThemeToggle`, `DentalThemeBridge`, viewer state restore) always uses `useActiveTheme()`. The theme customization module in `customizationService` enables the Appearance menu; the provider must be mounted for either path to work.

**`APP_CONFIG`:** Local `pnpm run dev` uses `config/dental.js` by default. Without it, the viewer falls back to `config/default.js`, which does not enable the theme module or dental-specific settings.

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
2. Open the study list.
3. **Select a study** in the table (single click).
4. In the right **preview panel**, under **Launch workflow**, click **Dental Mode** (or double-click the study row if dental is your default workflow).
5. Optionally set a persistent default: preview panel **gear** → **Default Workflow** → `@ohif/mode-dental` / **Dental Mode**. Config key `defaultWorkflowModeId` pre-selects this when nothing is stored in `localStorage` (`studyList.defaultWorkflow`).
6. Dental Mode opens with the custom layout and 2×2 hanging protocol.
7. Use the **Dental / Standard** theme toggle in the practice header.
8. Select a tooth and numbering system (FDI / Universal).
9. Click **Measurements** → choose a preset → draw on the viewport.
10. Review measurements in the right panel; filter, sort, **Export JSON**, or save to the server.

> **Note:** The launch buttons only appear after a study is selected. If you see no workflows, see [Dental Mode not listed](#dental-mode-not-listed-in-study-list) below.

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
| Theme provider / App wiring | `extensions/dental/src/index.ts`, `platform/app/src/App.tsx` |
| Toolbar / tools | `modes/dental/src/toolbarButtons.ts`, `initToolGroups.ts` |

## Verification checklist

- [ ] `docker compose up` — viewer at :8080, API at :3000
- [ ] `/login` gate — unauthenticated users cannot access study list
- [ ] Practice header shows practice name, patient info, tooth selector
- [ ] Study list preview shows **Dental Mode** launch button after selecting a study
- [ ] Theme toggle switches dental teal palette
- [ ] Appearance menu opens without runtime errors
- [ ] 2×2 grid loads (bottom bitewing slots may be empty without bitewing DICOM)
- [ ] Measurements palette activates Length/Angle tools with dental labels
- [ ] Panel sort reorders the visible measurement list
- [ ] Export JSON downloads measurement file
- [ ] After login + tooth change → `GET /api/v1/viewer-state` returns saved state
- [ ] Logout returns to login page

## Troubleshooting

### `WebSocket connection to 'ws://localhost:3000/ws' failed`

This is the **rspack dev-server hot-reload** socket, not the dental API or DICOMweb.

**Cause:** Port 3000 is used by the NestJS API (`app/api`). If the OHIF dev server also binds to 3000, or you open the viewer at the wrong port, the HMR client tries `ws://localhost:3000/ws` against the API (which has no `/ws` endpoint).

**Fix:**

1. Run the API on **http://localhost:3000** and the viewer with `pnpm run dev:dental` on **http://localhost:3001** (default `OHIF_PORT=3001` in `dev` / `dev:dental` scripts).
2. Restart the viewer dev server after pulling this change.
3. Open **http://localhost:3001**, not :3000.

The warning is harmless if you are not actively using hot reload, but fixing the port split removes console noise.

### `Error: request failed` (dicomweb-client)

Often a failed DICOMweb thumbnail or image request surfacing as an uncaught rejection. `dental.js` uses `thumbnailRendering: 'wadors'` for the CloudFront static WADO source (same as other OHIF configs for that server). Hard-refresh after config changes.

### `useActiveTheme must be used within an ActiveThemeProvider`

This error appears when dental UI or the **Appearance** dialog calls `useActiveTheme()` but the provider is missing or mounted in the wrong place.

**Causes and fixes:**

1. **Config** — `customizationService` in `dental.js` must include `@ohif/extension-default.customizationModule.theme`, and you must run with `APP_CONFIG=config/dental.js`.
2. **Provider registration** — `@ohif/extension-dental` registers `ActiveThemeProvider` in `preRegistration` (dental components depend on it).
3. **Provider order** — In `platform/app/src/App.tsx`, `ActiveThemeProvider` must sit **above** `ModalProvider` and `DialogProvider`. Modals render as children of `ModalProvider`; if the theme provider is nested below routes only, **Appearance** crashes on open.
4. **Stale build** — Restart the dev server after changing extension or `App.tsx` provider wiring.

### Appearance menu crashes on open

Same root cause as above: modal content is outside the theme context unless `ActiveThemeProvider` wraps `ModalProvider`. Apply fix (3) and hard-refresh.

### Dental theme looks wrong or unchanged

- The dental preset is a **dark** clinical teal palette (aligned with other OHIF tonal themes), not a light mint UI.
- A previous theme may be cached: `localStorage.removeItem('ohif:theme')` in devtools, or toggle **Dental / Standard** in the practice header.
- Hard-refresh after editing `platform/ui-next/src/themes/dental.json` or `themes.css`.

### Dental Mode not listed in study list

1. Confirm `@ohif/mode-dental` is in `pluginConfig.json`.
2. Confirm `APP_CONFIG=config/dental.js` (check `http://localhost:8080/app-config.js` or your dev port).
3. Confirm `modes/dental/src/index.ts` applies `modesConfiguration` with `immutability-helper` `update()` — not `...modeConfiguration` (see [modesConfiguration](#modesconfiguration-and-dental-mode-visibility)).
4. Run `pnpm install` in `app/web/Viewers` and restart the dev server so plugin imports regenerate.
5. Select a study in the table — workflow buttons render in the preview panel only when a row is selected.
6. Open preview panel **settings (gear)** → **Default Workflow** and choose **Dental Mode**, or rely on `defaultWorkflowModeId` in `dental.js`.

### Study list fails after login (CORS / network error)

The dental JWT must not be attached to DICOMweb requests. If you see failures against `cloudfront.net`, confirm `authApi.ts` returns an empty `getAuthorizationHeader` for DICOMweb and that auth bootstrap ran (check `dentalApiUrl` is set in config).

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
