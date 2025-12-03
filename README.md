# JobFinder - Job Search Platform

A full-stack job search platform built with Django (Backend) and React + Vite (Frontend).

## Project Structure

\\\
/
├── backend/          # Django REST API
│   ├── main/         # Django settings
│   ├── users/        # User management
│   ├── jobfinder/    # Job listings
│   └── start.py      # All-in-one startup script
│
└── frontend/         # React + Vite + TypeScript
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── contexts/
    │   └── lib/
    └── package.json
\\\

## Quick Start

### Backend

\\\ash
cd backend
python start.py
\\\

This will automatically:
- Create virtual environment
- Install dependencies  
- Run migrations
- Load fixtures
- Create superuser
- Start server at http://localhost:8000

### Frontend

\\\ash
cd frontend
npm install   # or: bun install
npm run dev   # or: bun dev
\\\

Frontend runs at http://localhost:5173

## Requirements

- Python 3.12+
- Node.js 18+ (or Bun)
- PostgreSQL 14+
- Cloudinary account (free)

## Configuration

1. Copy \.env.example\ to \.env\ in backend folder
2. Fill in your database and Cloudinary credentials

## Tech Stack

### Backend
- Django 5.2
- Django REST Framework
- PostgreSQL
- JWT Authentication
- Cloudinary (media storage)

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Shadcn/ui
- React Router

## API Documentation

- API Base: http://localhost:8000/api/
- Admin Panel: http://localhost:8000/admin/
