# Cây Sơ Đồ Dự Án JobFinder

```
CO3103/
├── README.md                          # Tài liệu chính của dự án
├── start_servers.py                   # Script để khởi động cả backend và frontend
│
├── backend/                           # Django REST Backend
│   ├── manage.py                      # Django management script
│   ├── requirements.txt               # Python dependencies
│   ├── Procfile                       # Procfile cho deployment
│   ├── db.sqlite3                     # SQLite database
│   │
│   ├── initial_venv.py               # Script khởi tạo virtual environment
│   ├── make_and_migrate.py           # Script chạy makemigrations và migrate
│   ├── load_fixtures.py              # Script load dữ liệu mẫu
│   ├── create_superuser.py           # Script tạo superuser
│   │
│   ├── main/                          # Django project settings
│   │   ├── __init__.py
│   │   ├── settings.py               # Cấu hình Django chính
│   │   ├── urls.py                   # URL routing chính
│   │   ├── asgi.py                   # ASGI config (async)
│   │   ├── wsgi.py                   # WSGI config (production)
│   │   └── __pycache__/
│   │
│   ├── users/                         # User & Authentication App
│   │   ├── __init__.py
│   │   ├── models.py                 # Model: CustomUser, Profile, Gender, Role
│   │   ├── serializers.py            # DRF serializers cho User
│   │   ├── views.py                  # ViewSets cho registration, authentication
│   │   ├── urls.py                   # URLs cho users endpoints
│   │   ├── admin.py                  # Django admin configuration
│   │   ├── apps.py                   # App configuration
│   │   ├── signals.py                # Django signals (keep profile in sync)
│   │   ├── __pycache__/
│   │   │
│   │   ├── migrations/               # Database migrations
│   │   │   ├── __init__.py
│   │   │   ├── 0001_initial.py
│   │   │   ├── 0002_customuser_avatar.py
│   │   │   ├── 0003_alter_customuser_avatar.py
│   │   │   ├── 0004_profile_cv_profile_cv_filename.py
│   │   │   ├── 0005_alter_gender_options_alter_role_options_and_more.py
│   │   │   ├── 0006_status_color_status_icon.py
│   │   │   └── __pycache__/
│   │   │
│   │   └── fixtures/                 # Dữ liệu mẫu cho lookup tables
│   │       └── users_lookups.json
│   │
│   └── jobfinder/                     # Job Search & Application App
│       ├── __init__.py
│       ├── models.py                 # Models: Form, Application, Currency, JobType, WorkFormat
│       ├── serializers.py            # DRF serializers cho Jobs và Applications
│       ├── views.py                  # ViewSets cho job listing, apply, manage applications
│       ├── urls.py                   # URLs cho jobfinder endpoints
│       ├── admin.py                  # Django admin configuration
│       ├── __pycache__/
│       │
│       ├── migrations/               # Database migrations
│       │   ├── __init__.py
│       │   ├── 0001_initial.py
│       │   ├── 0002_alter_currency_options_alter_jobtype_options_and_more.py
│       │   ├── 0003_application.py
│       │   └── __pycache__/
│       │
│       └── fixtures/                 # Dữ liệu mẫu (locations, job types, currencies)
│           ├── 01_lookups_basic.json
│           ├── 02_lookups_district.json
│           ├── 03_lookups_ward_part1.json
│           ├── 03_lookups_ward_part2.json
│           ├── 03_lookups_ward_part3.json
│           └── jobfinder_lookups.json
│
└── frontend/                          # React + Vite + TypeScript Frontend
    ├── package.json                   # NPM dependencies
    ├── bun.lockb                      # Bun package lock file
    ├── vite.config.ts                # Vite configuration
    ├── tsconfig.json                 # TypeScript configuration
    ├── tsconfig.app.json             # TypeScript app config
    ├── tsconfig.node.json            # TypeScript node config
    ├── index.html                    # HTML entry point
    ├── tailwind.config.ts            # Tailwind CSS configuration
    ├── postcss.config.js             # PostCSS configuration
    ├── eslint.config.js              # ESLint configuration
    ├── components.json               # Shadcn/ui components config
    ├── vercel.json                   # Vercel deployment config
    │
    ├── public/                        # Static assets
    │   └── robots.txt
    │
    └── src/                           # Source code
        ├── main.tsx                  # React entry point
        ├── App.tsx                   # Root component
        ├── App.css                   # Global styles
        ├── index.css                 # Index styles
        ├── vite-env.d.ts             # Vite environment types
        │
        ├── components/               # React components
        │   ├── JobCard.tsx           # Component hiển thị job card
        │   │
        │   ├── layout/               # Layout components
        │   │   ├── Navbar.jsx        # Header navigation
        │   │   └── Footer.jsx        # Footer
        │   │
        │   └── ui/                   # Shadcn/ui components (reusable)
        │       ├── accordion.tsx
        │       ├── alert-dialog.tsx
        │       ├── alert.tsx
        │       ├── aspect-ratio.tsx
        │       ├── avatar.tsx
        │       ├── badge.tsx
        │       ├── breadcrumb.tsx
        │       ├── button.tsx
        │       ├── calendar.tsx
        │       ├── card.tsx
        │       ├── carousel.tsx
        │       ├── chart.tsx
        │       ├── checkbox.tsx
        │       └── ... (nhiều components UI khác)
        │
        ├── contexts/                 # React Context (State Management)
        │   ├── AuthContext.tsx       # Authentication state (tokens, user, login/logout)
        │   └── JobsContext.tsx       # Jobs state (jobs list, applications)
        │
        ├── hooks/                    # Custom React hooks
        │   ├── use-mobile.tsx        # Hook để detect mobile screen
        │   └── use-toast.ts          # Hook để show toast notifications
        │
        ├── lib/                      # Utility functions
        │   ├── badge.ts             # Hàm helpers cho badge styling
        │   ├── jobfinder.ts         # API calls cho jobfinder endpoints
        │   └── utils.ts             # Utility functions chung
        │
        └── pages/                    # Page components
            ├── Index.tsx             # Trang chủ
            ├── Jobs.tsx              # Danh sách job
            ├── JobDetail.tsx         # Chi tiết job
            ├── Profile.tsx           # Trang profile người dùng
            ├── About.tsx             # Trang About
            ├── Contact.tsx           # Trang Contact
            ├── Policy.tsx            # Trang Policy
            ├── NotFound.tsx          # 404 page
            │
            ├── auth/                 # Authentication pages
            │   ├── Login.tsx
            │   └── Register.tsx
            │
            ├── employer/             # Employer pages
            │   ├── Dashboard.tsx
            │   ├── PostJob.tsx
            │   └── Applications.tsx
            │
            └── admin/                # Admin pages
                ├── Dashboard.tsx
                └── ... (admin components)
```

## Giải Thích Cấu Trúc

### Backend (Django)
- **main/**: Cấu hình Django chính (settings, URLs, WSGI/ASGI)
- **users/**: Quản lý xác thực người dùng, hồ sơ người dùng
- **jobfinder/**: Quản lý đăng tin việc làm, ứng tuyển công việc

### Frontend (React + Vite)
- **components/**: Các component React tái sử dụng
- **contexts/**: State management (AuthContext, JobsContext)
- **pages/**: Các trang chính của ứng dụng
- **lib/**: Hàm tiện ích, gọi API
- **hooks/**: Custom React hooks

## API Endpoints Chính

| Phương thức | Endpoint | Mô tả |
|-------------|----------|-------|
| GET | `/api/jobfinder/forms/` | Danh sách job công khai |
| GET | `/api/jobfinder/forms/<id>/` | Chi tiết job |
| POST | `/api/jobfinder/forms/<id>/apply/` | Ứng tuyển job |
| GET | `/api/jobfinder/applications/` | Danh sách ứng tuyển |
| POST | `/api/jobfinder/applications/<id>/approve/` | Phê duyệt ứng tuyển |
| POST | `/api/jobfinder/applications/<id>/reject/` | Từ chối ứng tuyển |
| POST | `/api/auth/token/` | Đăng nhập (JWT) |
| POST | `/api/auth/token/refresh/` | Làm mới token |

## Technology Stack

**Backend:**
- Django 5.x
- Django REST Framework
- Simple JWT (Authentication)
- SQLite / PostgreSQL
- Cloudinary (Media uploads)

**Frontend:**
- React 18+
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui Components
