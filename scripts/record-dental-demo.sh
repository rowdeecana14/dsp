#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VIEWERS="$ROOT/app/web/Viewers"
OUTPUT_DIR="$ROOT/docs/demo-video"

echo "==> Dental demo recorder"
echo "Requires Docker stack: cd docker && docker compose up -d"
echo ""

if ! curl -sf "${DENTAL_DEMO_URL:-http://localhost:8080}/" >/dev/null; then
  echo "ERROR: Viewer not reachable at ${DENTAL_DEMO_URL:-http://localhost:8080}"
  exit 1
fi

if ! curl -sf http://localhost:3000/api/v1/health >/dev/null; then
  echo "ERROR: API not reachable at http://localhost:3000/api/v1/health"
  exit 1
fi

cd "$VIEWERS"

if ! pnpm exec playwright --version >/dev/null 2>&1; then
  echo "Installing Playwright..."
  pnpm install
fi

pnpm exec playwright install chromium

mkdir -p "$OUTPUT_DIR"

DENTAL_DEMO_URL="${DENTAL_DEMO_URL:-http://localhost:8080}" \
  pnpm exec playwright test \
  --config=playwright.dental-demo.config.ts \
  --project=chromium

VIDEO_SRC="$(find "$VIEWERS/tests/dental-demo-results" -name 'video.webm' | head -1)"
if [[ -n "$VIDEO_SRC" ]]; then
  cp "$VIDEO_SRC" "$OUTPUT_DIR/dental-demo.webm"
  echo ""
  echo "Demo video saved to: $OUTPUT_DIR/dental-demo.webm"
  echo "Convert to MP4 (optional): ffmpeg -i $OUTPUT_DIR/dental-demo.webm $OUTPUT_DIR/dental-demo.mp4"
else
  echo "WARNING: No video file found under tests/dental-demo-results"
  exit 1
fi
