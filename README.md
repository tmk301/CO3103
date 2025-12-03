# JobFinder - Job Search Platform

A full-stack job search platform built with Django (Backend) and React + Vite (Frontend).

## 🚀 Quick Start (Easy - No PostgreSQL needed!)

### Option 1: Run both servers at once
```bash
# Windows - Double click or run:
start.bat
```

### Option 2: Run separately

**Backend:**
```bash
cd backend
python start.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The startup script will automatically:
- Create virtual environment
- Install dependencies  
- Run migrations
- Load fixtures
- Create superuser (interactive)
- Start server at http://localhost:8000

Frontend runs at http://localhost:8386

## 📋 Requirements

- **Python 3.12+**
- **Node.js 18+** (or Bun)
- **PostgreSQL 14+** _(Optional - SQLite is used by default)_
- **Cloudinary account** _(Optional - for media uploads)_

## ⚙️ Configuration

### Database Options

The project supports **both SQLite and PostgreSQL**:

| Database   | Configuration         | Notes                              |
|------------|----------------------|-------------------------------------|
| **SQLite** | `DB_ENGINE=sqlite`   | Default, no installation required   |
| PostgreSQL | `DB_ENGINE=postgresql` | Requires PostgreSQL installed     |

### Setup Steps

1. Go to `backend/` folder
2. Copy `.env.example` to `.env` (or it will be created automatically)
3. Edit `.env`:

```env
# For SQLite (default - recommended for demo/testing):
DB_ENGINE=sqlite

# For PostgreSQL:
# DB_ENGINE=postgresql
# DB_NAME=your_database_name
# DB_USER=your_database_user
# DB_PASSWORD=your_database_password
# DB_HOST=localhost
# DB_PORT=5432
```

4. Run `python start.py`

## Project Structure

```
/
├── backend/          # Django REST API
│   ├── main/         # Django settings
│   ├── users/        # User management
│   ├── jobfinder/    # Job listings
│   └── start.py      # All-in-one startup script
│
├── frontend/         # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── lib/
│   └── package.json
│
├── start.bat         # Start both servers (Windows)
└── start.ps1         # Start both servers (PowerShell)
```

## Tech Stack

### Backend
- Django 5.2
- Django REST Framework
- SQLite / PostgreSQL
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
