#!/bin/sh
set -e

cd /usr/src/web

corepack enable
corepack prepare pnpm@11.5.2 --activate

if [ -f pnpm-lock.yaml ]; then
  pnpm install
elif [ -f package-lock.json ]; then
  npm install
fi

if ! pnpm run dev; then
  npm run dev
fi
