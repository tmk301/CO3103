# CO3103 — Frontend

This folder contains the frontend for the CO3103 project (Vite + React).

## Prerequisites

- Node.js 16+ (or the version specified in the repo)
- npm or pnpm

## Setup

Install dependencies:

```powershell
npm install
# or with pnpm:
# pnpm install
```

## Run (development)

Start the dev server:

```powershell
npm run dev
# or with pnpm:
# pnpm dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Build (production)

```powershell
npm run dev
# or
# npm run build
```

Serve the production build locally (optional):

```powershell
npm run preview
```

## Environment: backend URL

This frontend can use an environment variable `VITE_API_BASE_URL` to call the backend in production.

- Development example (PowerShell):

```powershell
$env:VITE_API_BASE_URL="http://localhost:8000"
npm run dev
```

- In Vercel: go to Project Settings → Environment Variables and add:
	- Key: `VITE_API_BASE_URL`
	- Value: `https://your-backend.example.com`

If `VITE_API_BASE_URL` is empty the app will still call relative paths (e.g. `/api/login/`).