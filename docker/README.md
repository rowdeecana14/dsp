# Docker Development Setup

This folder contains a Docker-based development environment for the OHIF Medical Imaging Viewer and its API.

```bash
# OHIF Medical Imaging Viewer development setup
#
# Setup:
#   1. Place the OHIF viewer source in ../app/web/Viewers
#   2. Place your backend source in ../app/Api (optional if you have an API)
#   3. Create or update docker/.env.docker with your MySQL credentials
#
# Run:
#   cd /home/rudy/projects/dsp/docker
#   docker compose --env-file .env.docker up -d --build
#
# Viewer URL: http://localhost:8080
# API URL: http://localhost:3000
# MySQL: localhost:3306
```

## OHIF Medical Imaging Viewer

The OHIF Viewer is a React-based medical imaging viewer that can display DICOM images and connect to DICOMweb servers. This Docker setup is intended for local development of the viewer plus an optional backend API.

## What this setup does

- starts a local MySQL database
- starts a backend API container from `app/Api`
- starts the frontend Viewer container from `app/web/Viewers`
- mounts local source code into containers so code changes are reflected immediately

## Setup

1. Ensure your project root has the following folders:
   - `app/web/Viewers`
   - `app/Api`
2. Copy or update `docker/.env.docker` with your desired MySQL credentials.
3. From the `docker/` directory run:

```bash
cd /home/rudy/projects/dsp/docker
docker compose --env-file .env.docker up -d --build
```

## Local OHIF Viewer setup

If you want to prepare or run the OHIF viewer manually using the official development workflow, follow these steps:

1. Ensure the OHIF source is available in `app/web/Viewers`.
2. Open a terminal at the viewer root:
   ```bash
cd /home/rudy/projects/dsp/app/web/Viewers
```
3. Restore dependencies:
   ```bash
yarn install --frozen-lockfile
```
4. Start the local development server:
   ```bash
yarn run dev
```

This mirrors the OHIF getting started guide at https://docs.ohif.org/development/getting-started.

## How to run

- Start containers (frontend + database):
  ```bash
docker compose --env-file .env.docker up -d --build
```
- Start containers including the optional backend API:
  ```bash
docker compose --env-file .env.docker --profile api up -d --build
```
- Stop containers:
  ```bash
docker compose down
```
- View logs:
  ```bash
docker compose logs -f
```

## Services

- `mysql` - MySQL 8 database service
- `api` - backend API container using source from `../app/Api` (optional; enabled with a Compose profile)
- `web` - frontend Viewer container using source from `../app/web/Viewers`

## Ports

- Frontend Viewer: `http://localhost:8080`
- Backend API: `http://localhost:3000` (only available when the `api` profile is enabled and `app/Api` contains a valid backend project)
- MySQL: `localhost:3306`

## Notes

- This is a development-only Docker setup.
- `app/web/Viewers` and `app/Api` must contain the source code for the frontend and backend respectively.
- Dependency installation happens inside the containers at startup.
- If you want to use a different env file name, adjust the `--env-file` flag accordingly.
