# Backend - Job Finder API

## Setup

### 1. Tạo virtual environment và cài dependencies
```bash
python -m venv .venv
.venv\Scripts\Activate.ps1  # Windows PowerShell
# hoặc
source .venv/bin/activate   # Linux/Mac

pip install -r requirements.txt
```

### 2. Migrate database
```bash
python manage.py migrate
```

### 3. Load lookup data (QUAN TRỌNG)
Để đảm bảo dữ liệu lookup (Role, Status, Gender, Province, District, Ward, etc.) đồng nhất trên mọi máy:

```bash
python load_fixtures.py
```

Hoặc load từng file:
```bash
python manage.py loaddata users/fixtures/users_lookups.json
python manage.py loaddata jobfinder/fixtures/jobfinder_lookups.json
```

### 4. Tạo superuser (nếu cần)
```bash
python manage.py createsuperuser
```

### 5. Chạy server
```bash
python manage.py runserver
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
