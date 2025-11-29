# AI Workforce Solutions - Dashboard v2.0

Dashboard quản lý tổng hợp với đầy đủ tính năng CRUD và Export.

## ✨ Tính năng mới v2.0

- ✅ **Thêm/Sửa/Xóa** dữ liệu trực tiếp trên giao diện
- ✅ **Xuất Excel** - Từng phần hoặc tất cả
- ✅ **Form nhập liệu** cho Nhân sự, Khóa học, Leads
- ✅ **Dữ liệu reactive** - Cập nhật ngay lập tức

---

## 🚀 Cập nhật lên Vercel

### Bước 1: Thay thế file trong project cũ

```bash
# Vào thư mục project đã clone
cd aiws-dashboard-project

# Xóa file cũ
rm src/AIWSDashboard.jsx
rm package.json

# Copy file mới vào (từ file tải về)
```

### Bước 2: Push lên GitHub

```bash
git add .
git commit -m "Update v2.0 - Add CRUD and Export features"
git push
```

### Bước 3: Vercel tự động deploy! 🎉

---

## 📖 Hướng dẫn sử dụng

### Xuất báo cáo Excel
1. Click nút **"📥 Xuất báo cáo"** ở góc trên phải
2. Chọn loại báo cáo muốn xuất
3. File Excel sẽ tự động tải về

### Thêm dữ liệu mới
1. Chuyển đến tab tương ứng (Nhân sự, Khóa học, Sales)
2. Click nút **"➕ Thêm..."**
3. Điền form và nhấn **"Lưu"**

### Chỉnh sửa dữ liệu
1. Tìm dòng cần sửa trong bảng
2. Click nút **"✏️ Sửa"**
3. Chỉnh sửa và nhấn **"Lưu"**

### Xóa dữ liệu
1. Click nút **"🗑️"** ở dòng cần xóa
2. Xác nhận xóa

---

## 🔗 Giai đoạn 2: Kết nối Google Sheets (Tùy chọn)

Để data lưu vĩnh viễn và team có thể edit trong Google Sheets:

### Bước 1: Tạo Google Sheet

1. Vào [Google Sheets](https://sheets.google.com) → Tạo sheet mới
2. Tạo 3 sheet con: `Employees`, `Courses`, `Leads`
3. Copy data từ Excel đã xuất vào

### Bước 2: Publish Google Sheet

1. File → Share → Publish to web
2. Chọn "Entire Document" → "CSV"
3. Copy link

### Bước 3: Cài đặt trong code

Thêm vào `AIWSDashboard.jsx`:

```javascript
// Thay URL bằng link của bạn
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID';
const EMPLOYEES_SHEET = 'Employees';
const COURSES_SHEET = 'Courses';
const LEADS_SHEET = 'Leads';

const fetchGoogleSheet = async (sheetName) => {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
  const response = await fetch(url);
  const text = await response.text();
  const json = JSON.parse(text.substring(47).slice(0, -2));
  return json.table.rows.map(row => {
    const obj = {};
    json.table.cols.forEach((col, i) => {
      obj[col.label] = row.c[i]?.v || '';
    });
    return obj;
  });
};

// Trong useEffect:
useEffect(() => {
  fetchGoogleSheet(EMPLOYEES_SHEET).then(setEmployees);
  fetchGoogleSheet(COURSES_SHEET).then(setCourses);
  fetchGoogleSheet(LEADS_SHEET).then(setLeads);
}, []);
```

---

## 🗄️ Giai đoạn 3: Kết nối Supabase (Nâng cao)

Để có database thực sự với authentication:

### Bước 1: Tạo tài khoản Supabase

1. Vào [supabase.com](https://supabase.com) → Sign up
2. Create new project
3. Đợi project khởi tạo (~2 phút)

### Bước 2: Tạo tables

Vào SQL Editor, chạy:

```sql
-- Employees table
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  department TEXT,
  status TEXT DEFAULT 'active',
  workload INTEGER DEFAULT 0,
  courses INTEGER DEFAULT 0,
  performance INTEGER DEFAULT 0,
  salary BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  instructor TEXT,
  students INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming',
  revenue BIGINT DEFAULT 0,
  start_date DATE,
  end_date DATE,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leads table
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  company TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  phone TEXT,
  value BIGINT DEFAULT 0,
  stage TEXT DEFAULT 'discovery',
  probability INTEGER DEFAULT 0,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Bước 3: Lấy API keys

1. Vào Settings → API
2. Copy `Project URL` và `anon public` key

### Bước 4: Cài Supabase client

```bash
npm install @supabase/supabase-js
```

### Bước 5: Kết nối trong code

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

// Fetch data
const { data: employees } = await supabase.from('employees').select('*');

// Insert
await supabase.from('employees').insert([newEmployee]);

// Update
await supabase.from('employees').update(updatedData).eq('id', id);

// Delete
await supabase.from('employees').delete().eq('id', id);
```

---

## 📁 Cấu trúc Project

```
aiws-dashboard/
├── public/
│   └── favicon.svg
├── src/
│   ├── AIWSDashboard.jsx    # Component chính (v2.0)
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json             # Đã thêm xlsx library
├── vite.config.js
└── README.md
```

---

## 🛠️ Chạy Local

```bash
npm install
npm run dev
# Mở http://localhost:5173
```

---

## 📞 Hỗ trợ

Nếu cần hỗ trợ thêm về:
- Kết nối Google Sheets
- Setup Supabase
- Thêm tính năng mới

Hãy liên hệ hoặc hỏi Claude! 🤖

---

© 2025 AI Workforce Solutions
