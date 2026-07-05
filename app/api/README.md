# Dental Viewer Backend

Backend service for the Dental OHIF Viewer providing state persistence and authentication.

## Features

- JWT-based authentication
- Viewer state persistence (mode, theme, selected tooth, etc.)
- Measurement storage and retrieval
- CORS support for frontend communication
- JSON file-based storage (MVP)

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` as needed:
```
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### Development

Start the development server with auto-reload:

```bash
npm run start:dev
```

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

**Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "token": "eyJhbGci...",
  "user": { "id": "u1", "email": "...", "name": "..." }
}
```

### Viewer State

**Get State**
```
GET /api/viewer-state?studyInstanceUID=1.2.3.4.5
Authorization: Bearer {token}
```

**Save State**
```
POST /api/viewer-state
Authorization: Bearer {token}
Content-Type: application/json

{
  "studyInstanceUID": "1.2.3.4.5",
  "mode": "dental",
  "theme": "dental",
  "selectedTooth": "11",
  "toothSystem": "FDI",
  "measurements": []
}
```

### Measurements

**Get Measurements**
```
GET /api/measurements?studyInstanceUID=1.2.3.4.5
Authorization: Bearer {token}
```

**Save Measurements**
```
POST /api/measurements
Authorization: Bearer {token}
Content-Type: application/json

{
  "studyInstanceUID": "1.2.3.4.5",
  "measurements": [...]
}
```

**Delete Measurement**
```
DELETE /api/measurements/{id}
Authorization: Bearer {token}
```

## Mock Users (Development)

- **Email:** user1@example.com  
  **Password:** password  
  **Name:** Dr. Smith

- **Email:** user2@example.com  
  **Password:** password  
  **Name:** Dr. Jones

## Database

Currently uses JSON file storage at `src/database/storage.json` for MVP.

For production, integrate with:
- PostgreSQL
- MongoDB
- Firebase
- etc.

## Troubleshooting

### Port already in use
```bash
# Use a different port
PORT=4000 npm start
```

### CORS errors
Update `CORS_ORIGIN` in `.env` to match your frontend URL:
```
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### Token expired
Frontend will automatically redirect to login page on 401 response.

## License

MIT
