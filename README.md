# Backend - Job Finder API

## Yêu cầu hệ thống

- Python 3.12+
- PostgreSQL 14+
- Tài khoản Cloudinary (miễn phí) - https://cloudinary.com

## Setup nhanh (Khuyến nghị)

```bash
# 1. Tạo virtual environment
python -m venv .venv
.venv\Scripts\Activate.ps1  # Windows PowerShell
# hoặc: source .venv/bin/activate  # Linux/Mac

# 2. Cài dependencies
pip install -r requirements.txt

# 3. Tạo file .env từ mẫu và điền thông tin
cp .env.example .env

# 4. Chạy setup tự động (migrate + fixtures + superuser + server)
python start.py
```

## Setup chi tiết

### 1. Cài đặt PostgreSQL

**Windows:** Tải từ https://www.postgresql.org/download/windows/

**Mac:** `brew install postgresql && brew services start postgresql`

**Linux:** `sudo apt install postgresql postgresql-contrib`

### 2. Tạo database

```sql
psql -U postgres
CREATE DATABASE jobfinder;
\q
```

### 3. Cấu hình Cloudinary

1. Đăng ký tại https://cloudinary.com (miễn phí)
2. Vào Dashboard, copy Cloud name, API Key, API Secret

### 4. Cấu hình .env

```bash
cp .env.example .env
```

Điền thông tin vào `.env`:
```env
SECRET_KEY=your-random-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=jobfinder
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 5. Chạy setup

```bash
python start.py
```

Hoặc thủ công:
```bash
python manage.py migrate
python load_fixtures.py
python manage.py createsuperuser
python manage.py runserver 8000
```

## Các lệnh hữu ích

```bash
python start.py           # Chạy server (lần đầu tự động setup)
python start.py 8080      # Chạy trên port khác
python start.py --reset   # Reset và setup lại từ đầu
```

## Fixtures

### users_lookups.json
- **Role**: USER, ADMIN
- **Status**: ACTIVE, INACTIVE, PENDING_VERIFICATION, LOCKED, SUSPENDED, BANNED
- **Gender**: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY

### jobfinder_lookups.json
- **VerifiedCompany**: Các công ty đã xác minh (FPT, VNG, Vingroup, etc.)
- **WorkFormat**: REMOTE, ONSITE, HYBRID
- **JobType**: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE
- **Currency**: VND, USD
- **AdministrativeUnit**: Các loại đơn vị hành chính
- **Province**: 63 tỉnh/thành phố
- **District**: Các quận/huyện
- **Ward**: Các phường/xã

## Export fixtures mới

Nếu cần export lại dữ liệu lookup:

```python
# Chạy trong Django shell hoặc script
import django
django.setup()
import json
from django.core import serializers

# Export users lookups
from users.models import Role, Status, Gender
data = []
for model in [Role, Status, Gender]:
    data.extend(json.loads(serializers.serialize('json', model.objects.all())))
with open('users/fixtures/users_lookups.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

# Export jobfinder lookups
from jobfinder.models import VerifiedCompany, WorkFormat, JobType, Currency, AdministrativeUnit, Province, District, Ward
data = []
for model in [VerifiedCompany, WorkFormat, JobType, Currency, AdministrativeUnit, Province, District, Ward]:
    data.extend(json.loads(serializers.serialize('json', model.objects.all())))
with open('jobfinder/fixtures/jobfinder_lookups.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
```

## API Endpoints

### Authentication
- `POST /api/users/register/` - Đăng ký
- `POST /api/users/login/` - Đăng nhập (lấy JWT token)
- `POST /api/users/token/refresh/` - Refresh token
- `GET /api/users/me/` - Thông tin user hiện tại

### Jobs
- `GET /api/jobfinder/forms/` - Danh sách jobs
- `POST /api/jobfinder/forms/` - Tạo job mới
- `GET /api/jobfinder/forms/{id}/` - Chi tiết job
- `POST /api/jobfinder/forms/{id}/approve/` - Duyệt job (Admin)
- `POST /api/jobfinder/forms/{id}/reject/` - Từ chối job (Admin)
- `GET /api/jobfinder/forms/hidden/` - Jobs đã ẩn (Admin)
- `POST /api/jobfinder/forms/{id}/restore/` - Khôi phục job (Admin)

### Lookups
- `GET /api/jobfinder/provinces/` - Danh sách tỉnh/thành
- `GET /api/jobfinder/districts/` - Danh sách quận/huyện
- `GET /api/jobfinder/wards/` - Danh sách phường/xã
- `GET /api/jobfinder/work-formats/` - Hình thức làm việc
- `GET /api/jobfinder/job-types/` - Loại công việc
- `GET /api/jobfinder/currencies/` - Loại tiền tệ
- `GET /api/jobfinder/companies/` - Công ty đã xác minh
