# Hướng dẫn Deploy JobFinder

## 🚀 Option 1: Railway (Backend) + Vercel (Frontend) - Khuyến nghị

### A. Deploy Backend lên Railway

1. **Tạo tài khoản Railway**: https://railway.app

2. **Tạo project mới**:
   - Click "New Project" → "Deploy from GitHub repo"
   - Kết nối GitHub và chọn repository

3. **Cấu hình project**:
   - Railway sẽ tự detect là Python project
   - Vào **Settings** → **Root Directory**: nhập `backend`

4. **Thêm PostgreSQL Database**:
   - Click "+ New" → "Database" → "Add PostgreSQL"
   - Railway sẽ tự động set `DATABASE_URL` environment variable

5. **Cấu hình Environment Variables** (Settings → Variables):
   ```
   SECRET_KEY=your-secret-key-here-make-it-long-and-random
   DEBUG=False
   ALLOWED_HOSTS=*.railway.app,localhost
   
   # Cloudinary (để upload avatar/CV)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

6. **Deploy**:
   - Railway sẽ tự động deploy
   - Lấy URL từ Settings → Domains (ví dụ: `https://jobfinder-backend.railway.app`)

7. **Tạo Superuser** (nếu cần):
   - Vào Railway → Project → chọn service
   - Click tab "Settings" → "Generate Domain" nếu chưa có
   - Hoặc dùng Railway CLI:
     ```bash
     railway login
     railway link
     railway run python manage.py createsuperuser
     ```

---

### B. Deploy Frontend lên Vercel

1. **Tạo tài khoản Vercel**: https://vercel.com

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import từ GitHub repository

3. **Cấu hình**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Environment Variables**:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app
   ```
   (Thay bằng URL backend từ Railway)

5. **Deploy**: Click Deploy và chờ hoàn tất

---

## 🚀 Option 2: Render (Miễn phí 100%)

### Deploy Backend lên Render

1. Tạo tài khoản tại https://render.com

2. **New** → **Web Service** → Connect GitHub repo

3. **Cấu hình**:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt && pip install -r requirements-postgres.txt`
   - **Start Command**: `gunicorn main.wsgi`

4. **Environment Variables**: Giống Railway

5. **Thêm PostgreSQL**: New → PostgreSQL → Liên kết với web service

---

## 📝 Checklist trước khi Deploy

- [ ] Đã có tài khoản Cloudinary (để upload ảnh/file)
- [ ] Đã push code lên GitHub
- [ ] Đã tạo SECRET_KEY mới cho production
- [ ] Đã cấu hình CORS cho frontend domain

---

## 🔧 Cấu hình CORS cho Production

Sau khi có frontend URL, cập nhật `backend/main/settings.py`:

```python
# Thay CORS_ALLOW_ALL_ORIGINS = True bằng:
CORS_ALLOWED_ORIGINS = [
    'https://your-frontend.vercel.app',
    'http://localhost:8386',  # Local development
]
```

---

## 📱 Test sau khi Deploy

1. Truy cập Frontend URL
2. Đăng ký tài khoản mới
3. Đăng nhập
4. Test các chức năng: tìm việc, ứng tuyển, upload CV

---

## 💡 Tips

- **Free tier Railway**: 500 giờ/tháng (đủ để demo)
- **Free tier Vercel**: Unlimited cho personal projects
- **Free tier Render**: Có thể sleep sau 15 phút không hoạt động

---

## 🆘 Troubleshooting

### Lỗi 500 Internal Server Error
- Kiểm tra logs trong Railway/Render
- Đảm bảo tất cả environment variables đã được set

### Static files không load
- Chạy: `python manage.py collectstatic`
- Đảm bảo WhiteNoise đã được cấu hình

### CORS Error
- Kiểm tra CORS_ALLOWED_ORIGINS có đúng frontend URL
- Đảm bảo có scheme (https://)
