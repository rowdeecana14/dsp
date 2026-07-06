#!/bin/sh
set -e

cd /usr/src/web

corepack enable
corepack prepare pnpm@11.5.2 --activate

# Skip Cypress binary download in Docker dev — not needed to run the viewer.
export CYPRESS_INSTALL_BINARY=0

needs_install() {
  [ ! -f platform/app/node_modules/@ohif/ui-next/package.json ] && return 0
  [ ! -f platform/app/node_modules/@ohif/core/package.json ] && return 0
  [ ! -d node_modules/d3-array ] && return 0
  return 1
}

if [ -f pnpm-lock.yaml ]; then
  if needs_install; then
    echo "Installing dependencies (workspace)..."
    pnpm install --frozen-lockfile
  else
    echo "Dependencies look complete, skipping install."
  fi
elif [ -f package-lock.json ]; then
  npm install
fi

# Re-check after install
if needs_install; then
  echo "ERROR: node_modules is incomplete after install. Retrying with clean install..."
  pnpm install --frozen-lockfile --force
fi

if needs_install; then
  echo "ERROR: Could not install OHIF workspace dependencies."
  exit 1
fi

export APP_CONFIG="${APP_CONFIG:-config/dental.js}"
export REACT_APP_API_URL="${REACT_APP_API_URL:-http://localhost:3000/api/v1}"

exec pnpm run dev
