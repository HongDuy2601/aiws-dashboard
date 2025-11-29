# AI Workforce Solutions - Dashboard

Dashboard quản lý tổng hợp cho AI Workforce Solutions, bao gồm:
- 📊 Tổng quan KPIs
- 👥 Quản lý nhân sự & giảng viên
- 📚 Quản lý khóa học
- 💰 Tình hình tài chính & dự báo
- 🎯 Sales Pipeline (Leads & Deals)

## 🚀 Cách Deploy

### Cách 1: Deploy lên Vercel (Khuyến nghị - Miễn phí)

**Bước 1: Upload lên GitHub**
```bash
# Tạo repo mới trên GitHub, sau đó:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aiws-dashboard.git
git push -u origin main
```

**Bước 2: Deploy trên Vercel**
1. Vào [vercel.com](https://vercel.com) và đăng nhập bằng GitHub
2. Click "Add New Project"
3. Import repo `aiws-dashboard` từ GitHub
4. Vercel tự động detect Vite → Click "Deploy"
5. Đợi 1-2 phút, bạn sẽ có URL như: `aiws-dashboard.vercel.app`

---

### Cách 2: Deploy lên Netlify (Miễn phí)

**Bước 1: Build project**
```bash
npm install
npm run build
```

**Bước 2: Deploy**
1. Vào [netlify.com](https://netlify.com)
2. Kéo thả folder `dist` vào trang Netlify
3. Done! Bạn có URL ngay lập tức

---

### Cách 3: Chạy Local

```bash
# Cài dependencies
npm install

# Chạy development server
npm run dev

# Mở http://localhost:5173
```

---

## 📁 Cấu trúc Project

```
aiws-dashboard/
├── public/
│   └── favicon.svg
├── src/
│   ├── AIWSDashboard.jsx    # Component chính
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🔧 Tùy chỉnh Data

Để cập nhật data thực tế, mở file `src/AIWSDashboard.jsx` và chỉnh sửa các arrays:
- `employeesData` - Danh sách nhân viên
- `coursesData` - Danh sách khóa học
- `leadsData` - Danh sách leads/deals
- `financialData` - Dữ liệu tài chính

## 🔗 Kết nối Database (Nâng cao)

Để dashboard cập nhật data realtime, bạn có thể kết nối với:
- **Google Sheets API** - Đơn giản, phù hợp với data nhỏ
- **Supabase** - PostgreSQL miễn phí, dễ dùng
- **Firebase** - Realtime database
- **Airtable API** - No-code database

---

© 2025 AI Workforce Solutions
