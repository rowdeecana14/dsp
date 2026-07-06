# Demo Recording Script (≤5 minutes)

Use this script to record the assignment demo video with OBS Studio, Loom, or similar.

## Setup (before recording)

```bash
cd docker
docker compose up -d
docker compose exec api pnpm run migrate && docker compose exec api pnpm run db:seed
```

Open http://localhost:8080 in a clean browser profile (or incognito).

## Scene 1 — Login (~30s)

1. Show the **Dental login page** at `/login` (app redirects here when not signed in).
2. Sign in with `admin@example.com` / `change-me-strongly`.
3. Land on the **study list**.

## Scene 2 — Dental Mode UI (~90s)

1. Open a study (pick any from the list).
2. Point out the **Practice Header**: practice name, patient info, **tooth selector** (toggle FDI / Universal).
3. Toggle **Dental / Standard** theme.
4. Show the **2×2 layout**:
   - Top-left: current image
   - Top-right: prior exam (empty if single study; mention two `StudyInstanceUIDs` for comparison)
   - Bottom: bitewing placeholders

## Scene 3 — Measurements (~90s)

1. Click **Measurements** in the toolbar.
2. Select **PA length** → draw a line on the image → note auto-label.
3. Select **Canal angle** → draw angle measurement.
4. Open the **right measurements panel**:
   - Filter by label text
   - Change sort field and direction — list reorders
5. Click **Export JSON** → show downloaded file.

## Scene 4 — Backend sync (~60s)

1. Click **Save to Server** in the panel → confirm “Saved!”.
2. Change tooth or theme → wait ~2s for auto-save.
3. Optional: show Swagger at http://localhost:3000/api/docs or curl:

```bash
TOKEN="<paste JWT>"
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/viewer-state?study_instance_uid=<UID>&limit=1"
```

## Scene 5 — Logout (~15s)

1. Open header menu → **Logout**.
2. Confirm redirect to login page.

## Tips

- Keep browser zoom at 100%.
- Hide bookmarks bar for a cleaner frame.
- Total target: **4–5 minutes**.
