import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as XLSX from 'xlsx';

// ============================================
// INITIAL DATA
// ============================================
const initialEmployees = [
  { id: 1, name: 'Nguyễn Văn An', role: 'Giảng viên', department: 'AI Training', status: 'active', workload: 85, courses: 3, performance: 92, salary: 25000000 },
  { id: 2, name: 'Trần Thị Bình', role: 'Giảng viên', department: 'Digital Marketing', status: 'active', workload: 70, courses: 2, performance: 88, salary: 22000000 },
  { id: 3, name: 'Lê Hoàng Cường', role: 'Business Dev', department: 'Sales', status: 'active', workload: 90, courses: 0, performance: 95, salary: 30000000 },
  { id: 4, name: 'Phạm Minh Dũng', role: 'Giảng viên', department: 'E-commerce', status: 'active', workload: 65, courses: 2, performance: 85, salary: 20000000 },
  { id: 5, name: 'Võ Thị Em', role: 'Admin', department: 'Operations', status: 'active', workload: 75, courses: 0, performance: 90, salary: 15000000 },
  { id: 6, name: 'Hoàng Văn Phúc', role: 'Giảng viên', department: 'AI Training', status: 'on-leave', workload: 0, courses: 1, performance: 87, salary: 23000000 },
];

const initialCourses = [
  { id: 1, name: 'AI Fundamentals cho Doanh nghiệp', instructor: 'Nguyễn Văn An', students: 45, progress: 75, status: 'active', revenue: 135000000, start_date: '2025-01-15', end_date: '2025-03-15', category: 'AI Training' },
  { id: 2, name: 'Digital Marketing Masterclass', instructor: 'Trần Thị Bình', students: 38, progress: 60, status: 'active', revenue: 95000000, start_date: '2025-02-01', end_date: '2025-04-01', category: 'Digital Marketing' },
  { id: 3, name: 'E-commerce Strategy', instructor: 'Phạm Minh Dũng', students: 52, progress: 90, status: 'active', revenue: 156000000, start_date: '2024-12-01', end_date: '2025-02-28', category: 'E-commerce' },
  { id: 4, name: 'ChatGPT for Business', instructor: 'Nguyễn Văn An', students: 60, progress: 40, status: 'active', revenue: 180000000, start_date: '2025-02-15', end_date: '2025-05-15', category: 'AI Training' },
  { id: 5, name: 'SEO Advanced', instructor: 'Trần Thị Bình', students: 25, progress: 100, status: 'completed', revenue: 62500000, start_date: '2024-10-01', end_date: '2024-12-31', category: 'Digital Marketing' },
  { id: 6, name: 'AI Automation Workshop', instructor: 'Hoàng Văn Phúc', students: 30, progress: 20, status: 'upcoming', revenue: 90000000, start_date: '2025-03-01', end_date: '2025-04-30', category: 'AI Training' },
];

const initialLeads = [
  { id: 1, company: 'Công ty Dược phẩm ABC', contact: 'Nguyễn Văn X', email: 'nguyenx@abc.com', phone: '0901234567', value: 500000000, stage: 'negotiation', probability: 75, source: 'Referral', notes: 'Quan tâm đào tạo AI cho sales team' },
  { id: 2, company: 'Tập đoàn Thủy sản XYZ', contact: 'Trần Thị Y', email: 'trany@xyz.com', phone: '0912345678', value: 350000000, stage: 'proposal', probability: 60, source: 'Website', notes: 'Cần chatbot cho CSKH' },
  { id: 3, company: 'Ngân hàng VN Bank', contact: 'Lê Văn Z', email: 'lez@vnbank.com', phone: '0923456789', value: 800000000, stage: 'qualification', probability: 40, source: 'Event', notes: 'Gặp tại Tech Summit 2025' },
  { id: 4, company: 'FPT Software', contact: 'Phạm Văn W', email: 'phamw@fpt.com', phone: '0934567890', value: 450000000, stage: 'closed-won', probability: 100, source: 'LinkedIn', notes: 'Đã ký hợp đồng' },
  { id: 5, company: 'Vingroup Education', contact: 'Hoàng Thị V', email: 'hoangv@vingroup.com', phone: '0945678901', value: 650000000, stage: 'negotiation', probability: 70, source: 'Referral', notes: 'Đang thương thảo giá' },
  { id: 6, company: 'Techcombank', contact: 'Võ Văn U', email: 'vou@techcombank.com', phone: '0956789012', value: 300000000, stage: 'discovery', probability: 25, source: 'Cold Call', notes: 'Mới liên hệ lần đầu' },
];

const initialStudents = [
  { id: 1, full_name: 'Nguyễn Minh Tuấn', phone: '0901111222', email: 'tuan.nm@gmail.com', date_of_birth: '1995-03-15', gender: 'male', address: '123 Nguyễn Huệ, Q1', city: 'Hồ Chí Minh', occupation: 'Marketing Manager', company: 'ABC Company', course_id: 1, course_name: 'AI Fundamentals cho Doanh nghiệp', enrollment_date: '2025-01-10', start_date: '2025-01-15', tuition_fee: 3500000, discount_amount: 500000, final_fee: 3000000, paid_amount: 3000000, remaining_amount: 0, payment_status: 'paid', payment_method: 'transfer', source: 'Facebook', referral_by: null, student_status: 'active', attendance_rate: 95, progress: 80, assigned_instructor: 'Nguyễn Văn An', notes: 'Học viên chăm chỉ, hay đặt câu hỏi' },
  { id: 2, full_name: 'Trần Thị Hương', phone: '0912222333', email: 'huong.tt@gmail.com', date_of_birth: '1992-07-20', gender: 'female', address: '456 Lê Lợi, Q3', city: 'Hồ Chí Minh', occupation: 'HR Director', company: 'XYZ Corp', course_id: 1, course_name: 'AI Fundamentals cho Doanh nghiệp', enrollment_date: '2025-01-12', start_date: '2025-01-15', tuition_fee: 3500000, discount_amount: 0, final_fee: 3500000, paid_amount: 2000000, remaining_amount: 1500000, payment_status: 'partial', payment_method: 'cash', source: 'Referral', referral_by: 'Nguyễn Minh Tuấn', student_status: 'active', attendance_rate: 85, progress: 75, assigned_instructor: 'Nguyễn Văn An', notes: 'Được giới thiệu, quan tâm ứng dụng AI trong HR' },
  { id: 3, full_name: 'Lê Văn Hùng', phone: '0923333444', email: 'hung.lv@gmail.com', date_of_birth: '1990-11-08', gender: 'male', address: '789 Hai Bà Trưng, Q1', city: 'Hồ Chí Minh', occupation: 'CEO', company: 'StartupVN', course_id: 1, course_name: 'AI Fundamentals cho Doanh nghiệp', enrollment_date: '2025-01-08', start_date: '2025-01-15', tuition_fee: 3500000, discount_amount: 1000000, final_fee: 2500000, paid_amount: 2500000, remaining_amount: 0, payment_status: 'paid', payment_method: 'transfer', source: 'Event', referral_by: null, student_status: 'active', attendance_rate: 70, progress: 65, assigned_instructor: 'Nguyễn Văn An', notes: 'Bận rộn, hay vắng mặt nhưng rất quan tâm' },
  { id: 4, full_name: 'Phạm Thị Lan', phone: '0934444555', email: 'lan.pt@gmail.com', date_of_birth: '1998-05-25', gender: 'female', address: '321 Võ Văn Tần, Q3', city: 'Hồ Chí Minh', occupation: 'Content Creator', company: 'Freelancer', course_id: 2, course_name: 'Digital Marketing Masterclass', enrollment_date: '2025-01-20', start_date: '2025-02-01', tuition_fee: 2800000, discount_amount: 0, final_fee: 2800000, paid_amount: 1500000, remaining_amount: 1300000, payment_status: 'partial', payment_method: 'card', source: 'TikTok', referral_by: null, student_status: 'active', attendance_rate: 100, progress: 55, assigned_instructor: 'Trần Thị Bình', notes: 'Học viên trẻ, năng động' },
  { id: 5, full_name: 'Hoàng Đức Anh', phone: '0945555666', email: 'anh.hd@gmail.com', date_of_birth: '1988-09-12', gender: 'male', address: '654 CMT8, Q10', city: 'Hồ Chí Minh', occupation: 'Business Owner', company: 'Shop Online', course_id: 2, course_name: 'Digital Marketing Masterclass', enrollment_date: '2025-01-25', start_date: '2025-02-01', tuition_fee: 2800000, discount_amount: 300000, final_fee: 2500000, paid_amount: 2500000, remaining_amount: 0, payment_status: 'paid', payment_method: 'transfer', source: 'Google', referral_by: null, student_status: 'active', attendance_rate: 90, progress: 60, assigned_instructor: 'Trần Thị Bình', notes: 'Có shop online, muốn học quảng cáo' },
  { id: 6, full_name: 'Vũ Thị Mai', phone: '0956666777', email: 'mai.vt@gmail.com', date_of_birth: '1993-12-03', gender: 'female', address: '987 Điện Biên Phủ, Bình Thạnh', city: 'Hồ Chí Minh', occupation: 'Product Manager', company: 'E-com Platform', course_id: 3, course_name: 'E-commerce Strategy', enrollment_date: '2024-11-25', start_date: '2024-12-01', tuition_fee: 3200000, discount_amount: 0, final_fee: 3200000, paid_amount: 3200000, remaining_amount: 0, payment_status: 'paid', payment_method: 'transfer', source: 'Website', referral_by: null, student_status: 'completed', attendance_rate: 98, progress: 100, assigned_instructor: 'Phạm Minh Dũng', notes: 'Hoàn thành xuất sắc, đã cấp chứng chỉ' },
  { id: 7, full_name: 'Đỗ Văn Nam', phone: '0967777888', email: 'nam.dv@gmail.com', date_of_birth: '1996-02-18', gender: 'male', address: '147 Nguyễn Thị Minh Khai, Q1', city: 'Hồ Chí Minh', occupation: 'Sales Executive', company: 'Trading Co', course_id: 3, course_name: 'E-commerce Strategy', enrollment_date: '2024-11-28', start_date: '2024-12-01', tuition_fee: 3200000, discount_amount: 500000, final_fee: 2700000, paid_amount: 2700000, remaining_amount: 0, payment_status: 'paid', payment_method: 'cash', source: 'Zalo', referral_by: null, student_status: 'completed', attendance_rate: 88, progress: 100, assigned_instructor: 'Phạm Minh Dũng', notes: 'Hoàn thành tốt' },
  { id: 8, full_name: 'Ngô Thị Thảo', phone: '0978888999', email: 'thao.nt@gmail.com', date_of_birth: '1991-08-30', gender: 'female', address: '258 Lý Thường Kiệt, Q10', city: 'Hồ Chí Minh', occupation: 'Teacher', company: 'High School', course_id: 4, course_name: 'ChatGPT for Business', enrollment_date: '2025-02-10', start_date: '2025-02-15', tuition_fee: 2500000, discount_amount: 200000, final_fee: 2300000, paid_amount: 1000000, remaining_amount: 1300000, payment_status: 'partial', payment_method: 'transfer', source: 'Facebook', referral_by: null, student_status: 'active', attendance_rate: 80, progress: 35, assigned_instructor: 'Nguyễn Văn An', notes: 'Giáo viên muốn ứng dụng AI trong giảng dạy' },
  { id: 9, full_name: 'Bùi Minh Khoa', phone: '0989999000', email: 'khoa.bm@gmail.com', date_of_birth: '1985-04-05', gender: 'male', address: '369 Cách Mạng Tháng 8, Q3', city: 'Hồ Chí Minh', occupation: 'IT Manager', company: 'Bank', course_id: 4, course_name: 'ChatGPT for Business', enrollment_date: '2025-02-12', start_date: '2025-02-15', tuition_fee: 2500000, discount_amount: 0, final_fee: 2500000, paid_amount: 2500000, remaining_amount: 0, payment_status: 'paid', payment_method: 'transfer', source: 'LinkedIn', referral_by: null, student_status: 'active', attendance_rate: 95, progress: 45, assigned_instructor: 'Nguyễn Văn An', notes: 'Có background IT, tiếp thu nhanh' },
  { id: 10, full_name: 'Trương Văn Đạt', phone: '0990000111', email: 'dat.tv@gmail.com', date_of_birth: '1994-06-22', gender: 'male', address: '741 Pasteur, Q1', city: 'Hồ Chí Minh', occupation: 'Accountant', company: 'Consulting Firm', course_id: 2, course_name: 'Digital Marketing Masterclass', enrollment_date: '2025-01-15', start_date: '2025-02-01', tuition_fee: 2800000, discount_amount: 0, final_fee: 2800000, paid_amount: 500000, remaining_amount: 2300000, payment_status: 'partial', payment_method: 'cash', source: 'Cold Call', referral_by: null, student_status: 'dropped', attendance_rate: 20, progress: 10, assigned_instructor: 'Trần Thị Bình', notes: 'Bỏ học sau 2 buổi, lý do cá nhân. Cần follow up hoàn tiền.' },
];

const initialFinancialData = {
  actual: [
    { month: 'T8/24', revenue: 450, expenses: 320, profit: 130, courses: 4 },
    { month: 'T9/24', revenue: 520, expenses: 350, profit: 170, courses: 5 },
    { month: 'T10/24', revenue: 480, expenses: 330, profit: 150, courses: 4 },
    { month: 'T11/24', revenue: 620, expenses: 400, profit: 220, courses: 6 },
    { month: 'T12/24', revenue: 750, expenses: 450, profit: 300, courses: 7 },
    { month: 'T1/25', revenue: 680, expenses: 420, profit: 260, courses: 6 },
    { month: 'T2/25', revenue: 720, expenses: 440, profit: 280, courses: 7 },
  ],
  forecast: [
    { month: 'T3/25', revenue: 780, expenses: 460, profit: 320, type: 'forecast' },
    { month: 'T4/25', revenue: 850, expenses: 490, profit: 360, type: 'forecast' },
    { month: 'T5/25', revenue: 920, expenses: 520, profit: 400, type: 'forecast' },
    { month: 'T6/25', revenue: 980, expenses: 550, profit: 430, type: 'forecast' },
  ]
};

// ============================================
// MODAL COMPONENT
// ============================================
const Modal = ({ isOpen, onClose, title, children, wide }) => {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: wide ? '900px' : '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(148, 163, 184, 0.2)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px'
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ============================================
// FORM INPUT COMPONENT
// ============================================
const FormInput = ({ label, type = 'text', value, onChange, options, required, placeholder, disabled }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94A3B8' }}>
      {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
    </label>
    {type === 'select' ? (
      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: disabled ? 'rgba(15, 23, 42, 0.5)' : 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '8px',
          color: '#F1F5F9',
          fontSize: '14px',
          outline: 'none'
        }}
      >
        <option value="">Chọn...</option>
        {options?.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    ) : type === 'textarea' ? (
      <textarea
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={3}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '8px',
          color: '#F1F5F9',
          fontSize: '14px',
          outline: 'none',
          resize: 'vertical'
        }}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: disabled ? 'rgba(15, 23, 42, 0.5)' : 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '8px',
          color: '#F1F5F9',
          fontSize: '14px',
          outline: 'none'
        }}
      />
    )}
  </div>
);

// ============================================
// STUDENT DETAIL MODAL
// ============================================
const StudentDetailModal = ({ student, onClose }) => {
  if (!student) return null;

  const InfoRow = ({ label, value, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <span style={{ fontSize: '13px', color: '#94A3B8' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: '500', color: color || '#F1F5F9' }}>{value || '—'}</span>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', borderRadius: '16px', padding: '24px',
        maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(148, 163, 184, 0.2)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Chi tiết Học viên</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'rgba(13, 148, 136, 0.1)', borderRadius: '12px', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'linear-gradient(135deg, #0D9488, #0F766E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', color: 'white' }}>
            {student.full_name?.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{student.full_name}</h3>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '14px' }}>{student.course_name}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94A3B8', textTransform: 'uppercase' }}>Thông tin cá nhân</h4>
            <InfoRow label="Số điện thoại" value={student.phone} />
            <InfoRow label="Email" value={student.email} />
            <InfoRow label="Ngày sinh" value={student.date_of_birth} />
            <InfoRow label="Giới tính" value={student.gender === 'male' ? 'Nam' : 'Nữ'} />
            <InfoRow label="Địa chỉ" value={student.address} />
            <InfoRow label="Nghề nghiệp" value={student.occupation} />
            <InfoRow label="Công ty" value={student.company} />
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94A3B8', textTransform: 'uppercase' }}>Thông tin học phí</h4>
            <InfoRow label="Học phí gốc" value={formatCurrency(student.tuition_fee) + ' VNĐ'} />
            <InfoRow label="Giảm giá" value={formatCurrency(student.discount_amount) + ' VNĐ'} color="#F59E0B" />
            <InfoRow label="Phải đóng" value={formatCurrency(student.final_fee) + ' VNĐ'} />
            <InfoRow label="Đã đóng" value={formatCurrency(student.paid_amount) + ' VNĐ'} color="#10B981" />
            <InfoRow label="Còn lại" value={formatCurrency(student.remaining_amount) + ' VNĐ'} color={student.remaining_amount > 0 ? '#EF4444' : '#10B981'} />
          </div>
        </div>

        {student.notes && (
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '20px', marginTop: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#94A3B8', textTransform: 'uppercase' }}>Ghi chú</h4>
            <p style={{ margin: 0, color: '#F1F5F9', fontSize: '14px', lineHeight: '1.6' }}>{student.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// HELPER FUNCTIONS
// ============================================
const formatCurrency = (value) => {
  if (!value) return '0';
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toLocaleString('vi-VN');
};

const getStageLabel = (stage) => {
  const labels = { 'discovery': 'Khám phá', 'qualification': 'Đánh giá', 'proposal': 'Đề xuất', 'negotiation': 'Đàm phán', 'closed-won': 'Thành công', 'closed-lost': 'Thất bại' };
  return labels[stage] || stage;
};

const getPaymentStatusLabel = (status) => {
  const labels = { 'paid': 'Đã đóng đủ', 'partial': 'Đóng 1 phần', 'unpaid': 'Chưa đóng' };
  return labels[status] || status;
};

const getStudentStatusLabel = (status) => {
  const labels = { 'active': 'Đang học', 'completed': 'Hoàn thành', 'dropped': 'Nghỉ học', 'paused': 'Tạm dừng' };
  return labels[status] || status;
};

const getSourceLabel = (source) => {
  const labels = { 'Facebook': 'Facebook', 'Website': 'Website', 'Referral': 'Giới thiệu', 'Event': 'Sự kiện', 'Zalo': 'Zalo', 'TikTok': 'TikTok', 'Google': 'Google Ads', 'LinkedIn': 'LinkedIn', 'Cold Call': 'Cold Call' };
  return labels[source] || source;
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
export default function AIWSDashboard() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [courses, setCourses] = useState(initialCourses);
  const [leads, setLeads] = useState(initialLeads);
  const [students, setStudents] = useState(initialStudents);
  const [financialData] = useState(initialFinancialData);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [filterCourseStatus, setFilterCourseStatus] = useState('all');
  const [filterStudentStatus, setFilterStudentStatus] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [searchStudent, setSearchStudent] = useState('');
  
  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [formData, setFormData] = useState({});
  const [viewStudent, setViewStudent] = useState(null);

  const COLORS = ['#0D9488', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981'];
  const STAGE_COLORS = { 'discovery': '#94A3B8', 'qualification': '#60A5FA', 'proposal': '#F59E0B', 'negotiation': '#8B5CF6', 'closed-won': '#10B981', 'closed-lost': '#EF4444' };
  const PAYMENT_COLORS = { 'paid': '#10B981', 'partial': '#F59E0B', 'unpaid': '#EF4444' };

  // CRUD Functions
  const openAddModal = (type) => { setModalType(type); setEditingItem(null); setFormData({}); };
  const openEditModal = (type, item) => { setModalType(type); setEditingItem(item); setFormData(item); };
  const closeModal = () => { setModalType(null); setEditingItem(null); setFormData({}); };

  const handleSave = () => {
    if (modalType === 'employee') {
      if (editingItem) {
        setEmployees(employees.map(e => e.id === editingItem.id ? { ...e, ...formData } : e));
      } else {
        setEmployees([...employees, { ...formData, id: Date.now() }]);
      }
    } else if (modalType === 'course') {
      if (editingItem) {
        setCourses(courses.map(c => c.id === editingItem.id ? { ...c, ...formData } : c));
      } else {
        setCourses([...courses, { ...formData, id: Date.now() }]);
      }
    } else if (modalType === 'lead') {
      if (editingItem) {
        setLeads(leads.map(l => l.id === editingItem.id ? { ...l, ...formData } : l));
      } else {
        setLeads([...leads, { ...formData, id: Date.now() }]);
      }
    } else if (modalType === 'student') {
      const studentData = {
        ...formData,
        final_fee: (parseInt(formData.tuition_fee) || 0) - (parseInt(formData.discount_amount) || 0),
        remaining_amount: ((parseInt(formData.tuition_fee) || 0) - (parseInt(formData.discount_amount) || 0)) - (parseInt(formData.paid_amount) || 0),
        payment_status: ((parseInt(formData.tuition_fee) || 0) - (parseInt(formData.discount_amount) || 0)) <= (parseInt(formData.paid_amount) || 0) ? 'paid' : (parseInt(formData.paid_amount) || 0) > 0 ? 'partial' : 'unpaid'
      };
      if (editingItem) {
        setStudents(students.map(s => s.id === editingItem.id ? { ...s, ...studentData } : s));
      } else {
        setStudents([...students, { ...studentData, id: Date.now() }]);
      }
    }
    closeModal();
  };

  const handleDelete = (type, id) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    if (type === 'employee') setEmployees(employees.filter(e => e.id !== id));
    else if (type === 'course') setCourses(courses.filter(c => c.id !== id));
    else if (type === 'lead') setLeads(leads.filter(l => l.id !== id));
    else if (type === 'student') setStudents(students.filter(s => s.id !== id));
  };

  // Export Functions
  const exportToExcel = (type) => {
    let data, fileName;
    switch(type) {
      case 'students':
        data = students.map(s => ({
          'Họ tên': s.full_name, 'Số điện thoại': s.phone, 'Email': s.email, 'Khóa học': s.course_name,
          'Học phí gốc': s.tuition_fee, 'Giảm giá': s.discount_amount, 'Phải đóng': s.final_fee,
          'Đã đóng': s.paid_amount, 'Còn lại': s.remaining_amount, 'Trạng thái TT': getPaymentStatusLabel(s.payment_status),
          'Trạng thái học': getStudentStatusLabel(s.student_status), 'Nguồn': s.source, 'Ghi chú': s.notes
        }));
        fileName = 'AIWS_HocVien';
        break;
      case 'employees':
        data = employees.map(e => ({ 'Họ tên': e.name, 'Chức vụ': e.role, 'Phòng ban': e.department, 'Trạng thái': e.status === 'active' ? 'Đang làm' : 'Nghỉ phép', 'Workload (%)': e.workload, 'Performance (%)': e.performance, 'Lương (VNĐ)': e.salary }));
        fileName = 'AIWS_NhanSu';
        break;
      case 'courses':
        data = courses.map(c => ({ 'Tên khóa học': c.name, 'Giảng viên': c.instructor, 'Số học viên': c.students, 'Tiến độ (%)': c.progress, 'Doanh thu (VNĐ)': c.revenue, 'Danh mục': c.category }));
        fileName = 'AIWS_KhoaHoc';
        break;
      case 'leads':
        data = leads.map(l => ({ 'Công ty': l.company, 'Người liên hệ': l.contact, 'Email': l.email, 'Giá trị (VNĐ)': l.value, 'Giai đoạn': getStageLabel(l.stage), 'Xác suất (%)': l.probability }));
        fileName = 'AIWS_Leads';
        break;
      case 'all':
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(students.map(s => ({ 'Họ tên': s.full_name, 'SĐT': s.phone, 'Email': s.email, 'Khóa học': s.course_name, 'Học phí': s.tuition_fee, 'Đã đóng': s.paid_amount, 'Còn lại': s.remaining_amount }))), 'Học viên');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(employees.map(e => ({ 'Họ tên': e.name, 'Chức vụ': e.role, 'Phòng ban': e.department }))), 'Nhân sự');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(courses.map(c => ({ 'Tên': c.name, 'Giảng viên': c.instructor, 'Doanh thu': c.revenue }))), 'Khóa học');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(leads.map(l => ({ 'Công ty': l.company, 'Giá trị': l.value, 'Giai đoạn': getStageLabel(l.stage) }))), 'Leads');
        XLSX.writeFile(wb, `AIWS_BaoCaoTongHop_${new Date().toISOString().split('T')[0]}.xlsx`);
        setShowExportMenu(false);
        return;
      default: return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    setShowExportMenu(false);
  };

  // Calculations
  const totalRevenue = financialData.actual.reduce((sum, d) => sum + d.revenue, 0);
  const studentStats = useMemo(() => {
    const totalTuition = students.reduce((sum, s) => sum + (s.final_fee || 0), 0);
    const totalPaid = students.reduce((sum, s) => sum + (s.paid_amount || 0), 0);
    const totalRemaining = students.reduce((sum, s) => sum + (s.remaining_amount || 0), 0);
    return { totalTuition, totalPaid, totalRemaining };
  }, [students]);

  const filteredEmployees = useMemo(() => filterDepartment === 'all' ? employees : employees.filter(e => e.department === filterDepartment), [filterDepartment, employees]);
  const filteredLeads = useMemo(() => filterStage === 'all' ? leads : leads.filter(l => l.stage === filterStage), [filterStage, leads]);
  const filteredCourses = useMemo(() => filterCourseStatus === 'all' ? courses : courses.filter(c => c.status === filterCourseStatus), [filterCourseStatus, courses]);
  
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (filterStudentStatus !== 'all' && s.student_status !== filterStudentStatus) return false;
      if (filterPaymentStatus !== 'all' && s.payment_status !== filterPaymentStatus) return false;
      if (searchStudent) {
        const q = searchStudent.toLowerCase();
        return s.full_name?.toLowerCase().includes(q) || s.phone?.includes(q) || s.email?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [students, filterStudentStatus, filterPaymentStatus, searchStudent]);

  const departmentDistribution = useMemo(() => {
    const dept = {};
    employees.forEach(e => { dept[e.department] = (dept[e.department] || 0) + 1; });
    return Object.entries(dept).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const sourceDistribution = useMemo(() => {
    const sources = {};
    students.forEach(s => { sources[s.source || 'Khác'] = (sources[s.source || 'Khác'] || 0) + 1; });
    return Object.entries(sources).map(([name, value]) => ({ name: getSourceLabel(name), value }));
  }, [students]);

  const pipelineStages = useMemo(() => {
    const stages = ['discovery', 'qualification', 'proposal', 'negotiation', 'closed-won'];
    return stages.map(stage => {
      const stageLeads = leads.filter(l => l.stage === stage);
      return { name: getStageLabel(stage), key: stage, deals: stageLeads.length, amount: Math.round(stageLeads.reduce((sum, l) => sum + (l.value || 0), 0) / 1000000) };
    });
  }, [leads]);

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: '📊' },
    { id: 'students', label: 'Học viên', icon: '🎓' },
    { id: 'employees', label: 'Nhân sự', icon: '👥' },
    { id: 'courses', label: 'Khóa học', icon: '📚' },
    { id: 'finance', label: 'Tài chính', icon: '💰' },
    { id: 'sales', label: 'Sales Pipeline', icon: '🎯' },
  ];

  // Form Renderers
  const renderEmployeeForm = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput label="Họ tên" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
        <FormInput label="Chức vụ" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} required />
      </div>
      <FormInput label="Phòng ban" type="select" value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} options={[{ value: 'AI Training', label: 'AI Training' }, { value: 'Digital Marketing', label: 'Digital Marketing' }, { value: 'E-commerce', label: 'E-commerce' }, { value: 'Sales', label: 'Sales' }, { value: 'Operations', label: 'Operations' }]} required />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <FormInput label="Workload (%)" type="number" value={formData.workload || ''} onChange={e => setFormData({...formData, workload: parseInt(e.target.value) || 0})} />
        <FormInput label="Performance (%)" type="number" value={formData.performance || ''} onChange={e => setFormData({...formData, performance: parseInt(e.target.value) || 0})} />
        <FormInput label="Lương (VNĐ)" type="number" value={formData.salary || ''} onChange={e => setFormData({...formData, salary: parseInt(e.target.value) || 0})} />
      </div>
    </>
  );

  const renderCourseForm = () => (
    <>
      <FormInput label="Tên khóa học" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput label="Giảng viên" value={formData.instructor || ''} onChange={e => setFormData({...formData, instructor: e.target.value})} required />
        <FormInput label="Danh mục" type="select" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} options={[{ value: 'AI Training', label: 'AI Training' }, { value: 'Digital Marketing', label: 'Digital Marketing' }, { value: 'E-commerce', label: 'E-commerce' }]} required />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <FormInput label="Số học viên" type="number" value={formData.students || ''} onChange={e => setFormData({...formData, students: parseInt(e.target.value) || 0})} />
        <FormInput label="Tiến độ (%)" type="number" value={formData.progress || ''} onChange={e => setFormData({...formData, progress: parseInt(e.target.value) || 0})} />
        <FormInput label="Doanh thu (VNĐ)" type="number" value={formData.revenue || ''} onChange={e => setFormData({...formData, revenue: parseInt(e.target.value) || 0})} />
      </div>
    </>
  );

  const renderLeadForm = () => (
    <>
      <FormInput label="Tên công ty" value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} required />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput label="Người liên hệ" value={formData.contact || ''} onChange={e => setFormData({...formData, contact: e.target.value})} required />
        <FormInput label="Giá trị deal (VNĐ)" type="number" value={formData.value || ''} onChange={e => setFormData({...formData, value: parseInt(e.target.value) || 0})} required />
      </div>
      <FormInput label="Giai đoạn" type="select" value={formData.stage || 'discovery'} onChange={e => setFormData({...formData, stage: e.target.value})} options={[{ value: 'discovery', label: 'Khám phá' }, { value: 'qualification', label: 'Đánh giá' }, { value: 'proposal', label: 'Đề xuất' }, { value: 'negotiation', label: 'Đàm phán' }, { value: 'closed-won', label: 'Thành công' }]} required />
      <FormInput label="Ghi chú" type="textarea" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} />
    </>
  );

  const renderStudentForm = () => (
    <>
      <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94A3B8', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '8px' }}>👤 Thông tin cá nhân</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput label="Họ và tên" value={formData.full_name || ''} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
        <FormInput label="Số điện thoại" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} required />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput label="Email" type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
        <FormInput label="Ngày sinh" type="date" value={formData.date_of_birth || ''} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <FormInput label="Giới tính" type="select" value={formData.gender || ''} onChange={e => setFormData({...formData, gender: e.target.value})} options={[{ value: 'male', label: 'Nam' }, { value: 'female', label: 'Nữ' }]} />
        <FormInput label="Nghề nghiệp" value={formData.occupation || ''} onChange={e => setFormData({...formData, occupation: e.target.value})} />
        <FormInput label="Công ty" value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} />
      </div>
      <FormInput label="Địa chỉ" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />

      <h4 style={{ margin: '24px 0 16px 0', fontSize: '14px', color: '#94A3B8', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '8px' }}>📚 Thông tin khóa học</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput label="Khóa học" type="select" value={formData.course_id || ''} onChange={e => {
          const course = courses.find(c => c.id.toString() === e.target.value);
          setFormData({ ...formData, course_id: parseInt(e.target.value), course_name: course?.name || '', assigned_instructor: course?.instructor || '' });
        }} options={courses.map(c => ({ value: c.id, label: c.name }))} required />
        <FormInput label="Giảng viên" value={formData.assigned_instructor || ''} disabled />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput label="Ngày đăng ký" type="date" value={formData.enrollment_date || ''} onChange={e => setFormData({...formData, enrollment_date: e.target.value})} />
        <FormInput label="Trạng thái" type="select" value={formData.student_status || 'active'} onChange={e => setFormData({...formData, student_status: e.target.value})} options={[{ value: 'active', label: 'Đang học' }, { value: 'completed', label: 'Hoàn thành' }, { value: 'dropped', label: 'Nghỉ học' }, { value: 'paused', label: 'Tạm dừng' }]} />
      </div>

      <h4 style={{ margin: '24px 0 16px 0', fontSize: '14px', color: '#94A3B8', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '8px' }}>💰 Thông tin học phí</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <FormInput label="Học phí gốc (VNĐ)" type="number" value={formData.tuition_fee || ''} onChange={e => setFormData({...formData, tuition_fee: parseInt(e.target.value) || 0})} required />
        <FormInput label="Giảm giá (VNĐ)" type="number" value={formData.discount_amount || ''} onChange={e => setFormData({...formData, discount_amount: parseInt(e.target.value) || 0})} />
        <FormInput label="Đã đóng (VNĐ)" type="number" value={formData.paid_amount || ''} onChange={e => setFormData({...formData, paid_amount: parseInt(e.target.value) || 0})} />
      </div>

      <h4 style={{ margin: '24px 0 16px 0', fontSize: '14px', color: '#94A3B8', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '8px' }}>📢 Nguồn & Marketing</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput label="Nguồn" type="select" value={formData.source || ''} onChange={e => setFormData({...formData, source: e.target.value})} options={[{ value: 'Facebook', label: 'Facebook' }, { value: 'Website', label: 'Website' }, { value: 'Referral', label: 'Giới thiệu' }, { value: 'Event', label: 'Sự kiện' }, { value: 'Zalo', label: 'Zalo' }, { value: 'TikTok', label: 'TikTok' }, { value: 'Google', label: 'Google Ads' }, { value: 'LinkedIn', label: 'LinkedIn' }, { value: 'Cold Call', label: 'Cold Call' }]} />
        <FormInput label="Người giới thiệu" value={formData.referral_by || ''} onChange={e => setFormData({...formData, referral_by: e.target.value})} />
      </div>
      <FormInput label="Ghi chú" type="textarea" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Thông tin thêm về học viên..." />
    </>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)', fontFamily: '"DM Sans", system-ui, sans-serif', color: '#F1F5F9', padding: '24px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        * { box-sizing: border-box; }
        .glass-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 16px; transition: all 0.3s ease; }
        .glass-card:hover { border-color: rgba(148, 163, 184, 0.2); transform: translateY(-2px); }
        .kpi-card { background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 16px; padding: 24px; position: relative; overflow: hidden; }
        .kpi-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--accent-color), transparent); }
        .tab-btn { padding: 12px 20px; border: none; background: transparent; color: #94A3B8; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; border-radius: 10px; transition: all 0.2s ease; }
        .tab-btn:hover { background: rgba(148, 163, 184, 0.1); color: #F1F5F9; }
        .tab-btn.active { background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); color: white; }
        .progress-bar { height: 8px; background: rgba(148, 163, 184, 0.2); border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
        .table-row { display: grid; padding: 16px; border-bottom: 1px solid rgba(148, 163, 184, 0.1); align-items: center; transition: background 0.2s ease; }
        .table-row:hover { background: rgba(148, 163, 184, 0.05); }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .filter-select { background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(148, 163, 184, 0.2); color: #F1F5F9; padding: 10px 16px; border-radius: 10px; font-family: inherit; font-size: 14px; cursor: pointer; outline: none; }
        .action-btn { padding: 6px 12px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s ease; font-family: inherit; }
        .action-btn:hover { transform: scale(1.05); }
        .action-btn.edit { background: rgba(59, 130, 246, 0.2); color: #60A5FA; }
        .action-btn.delete { background: rgba(239, 68, 68, 0.2); color: #EF4444; }
        .dropdown-menu { position: absolute; top: 100%; right: 0; margin-top: 8px; background: #1E293B; border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 12px; padding: 8px; min-width: 200px; z-index: 100; box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
        .dropdown-item { padding: 10px 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 14px; transition: background 0.2s; }
        .dropdown-item:hover { background: rgba(148, 163, 184, 0.1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.4s ease forwards; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🤖</div>
            <h1 style={{ fontSize: '28px', fontFamily: '"Space Grotesk", sans-serif', fontWeight: '700', background: 'linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>AI Workforce Solutions</h1>
          </div>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '14px' }}>Dashboard Quản lý Tổng hợp v3.0 • {new Date().toLocaleDateString('vi-VN')}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowExportMenu(!showExportMenu)} style={{ padding: '10px 20px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '10px', color: '#F1F5F9', fontFamily: 'inherit', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>📥 Xuất báo cáo ▾</button>
            {showExportMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={() => exportToExcel('all')}>📊 Xuất tất cả</div>
                <div className="dropdown-item" onClick={() => exportToExcel('students')}>🎓 Xuất Học viên</div>
                <div className="dropdown-item" onClick={() => exportToExcel('employees')}>👥 Xuất Nhân sự</div>
                <div className="dropdown-item" onClick={() => exportToExcel('courses')}>📚 Xuất Khóa học</div>
                <div className="dropdown-item" onClick={() => exportToExcel('leads')}>🎯 Xuất Leads</div>
              </div>
            )}
          </div>
          <button onClick={() => { if (activeTab === 'students') openAddModal('student'); else if (activeTab === 'employees') openAddModal('employee'); else if (activeTab === 'courses') openAddModal('course'); else if (activeTab === 'sales') openAddModal('lead'); else openAddModal('student'); }} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', border: 'none', borderRadius: '10px', color: 'white', fontFamily: 'inherit', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>➕ Thêm mới</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(30, 41, 59, 0.5)', padding: '8px', borderRadius: '14px', width: 'fit-content', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="animate-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="kpi-card" style={{ '--accent-color': '#0D9488' }}>
              <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Tổng doanh thu</p>
              <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0, fontFamily: '"Space Grotesk", sans-serif' }}>{totalRevenue}M</h2>
            </div>
            <div className="kpi-card" style={{ '--accent-color': '#3B82F6' }}>
              <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Học viên</p>
              <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0, fontFamily: '"Space Grotesk", sans-serif' }}>{students.length}</h2>
              <div style={{ color: '#94A3B8', fontSize: '13px', marginTop: '8px' }}>{students.filter(s => s.student_status === 'active').length} đang học</div>
            </div>
            <div className="kpi-card" style={{ '--accent-color': '#10B981' }}>
              <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Học phí đã thu</p>
              <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0, fontFamily: '"Space Grotesk", sans-serif', color: '#10B981' }}>{formatCurrency(studentStats.totalPaid)}</h2>
              <div style={{ color: '#EF4444', fontSize: '13px', marginTop: '8px' }}>Còn nợ: {formatCurrency(studentStats.totalRemaining)}</div>
            </div>
            <div className="kpi-card" style={{ '--accent-color': '#F59E0B' }}>
              <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Pipeline</p>
              <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0, fontFamily: '"Space Grotesk", sans-serif' }}>{formatCurrency(leads.filter(l => l.stage !== 'closed-won').reduce((sum, l) => sum + l.value, 0))}</h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>📈 Doanh thu (Triệu VNĐ)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={[...financialData.actual, ...financialData.forecast]}>
                  <defs><linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0D9488" stopOpacity={0.4}/><stop offset="95%" stopColor="#0D9488" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#0D9488" strokeWidth={2} fill="url(#revenueGradient)" name="Doanh thu" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>📊 Nguồn học viên</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={sourceDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                    {sourceDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* STUDENTS TAB */}
      {activeTab === 'students' && (
        <div className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>🎓 Quản lý Học viên ({students.length})</h3>
            <button onClick={() => openAddModal('student')} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', border: 'none', borderRadius: '10px', color: 'white', fontFamily: 'inherit', fontSize: '14px', cursor: 'pointer' }}>➕ Thêm học viên</button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}><div style={{ fontSize: '28px', fontWeight: '700', color: '#0D9488' }}>{students.length}</div><div style={{ fontSize: '13px', color: '#94A3B8' }}>Tổng học viên</div></div>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}><div style={{ fontSize: '28px', fontWeight: '700', color: '#3B82F6' }}>{students.filter(s => s.student_status === 'active').length}</div><div style={{ fontSize: '13px', color: '#94A3B8' }}>Đang học</div></div>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}><div style={{ fontSize: '28px', fontWeight: '700', color: '#10B981' }}>{formatCurrency(studentStats.totalPaid)}</div><div style={{ fontSize: '13px', color: '#94A3B8' }}>Đã thu</div></div>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}><div style={{ fontSize: '28px', fontWeight: '700', color: '#EF4444' }}>{formatCurrency(studentStats.totalRemaining)}</div><div style={{ fontSize: '13px', color: '#94A3B8' }}>Còn nợ</div></div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="🔍 Tìm kiếm tên, SĐT, email..." value={searchStudent} onChange={e => setSearchStudent(e.target.value)} style={{ padding: '10px 16px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '10px', color: '#F1F5F9', fontSize: '14px', outline: 'none', minWidth: '250px' }} />
            <select className="filter-select" value={filterStudentStatus} onChange={e => setFilterStudentStatus(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang học</option>
              <option value="completed">Hoàn thành</option>
              <option value="dropped">Nghỉ học</option>
            </select>
            <select className="filter-select" value={filterPaymentStatus} onChange={e => setFilterPaymentStatus(e.target.value)}>
              <option value="all">Tất cả thanh toán</option>
              <option value="paid">Đã đóng đủ</option>
              <option value="partial">Đóng 1 phần</option>
              <option value="unpaid">Chưa đóng</option>
            </select>
          </div>

          {/* Table */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div className="table-row" style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr 120px', background: 'rgba(15, 23, 42, 0.5)', fontWeight: '600', fontSize: '13px', color: '#94A3B8', textTransform: 'uppercase' }}>
              <div>Học viên</div><div>Liên hệ</div><div>Khóa học</div><div>Học phí</div><div>Đã đóng</div><div>Còn lại</div><div>Trạng thái</div><div>Thao tác</div>
            </div>
            {filteredStudents.map(s => (
              <div key={s.id} className="table-row" style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr 120px', cursor: 'pointer' }} onClick={() => setViewStudent(s)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `linear-gradient(135deg, ${COLORS[s.id % COLORS.length]}44, ${COLORS[s.id % COLORS.length]}22)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: COLORS[s.id % COLORS.length] }}>{s.full_name?.charAt(0)}</div>
                  <div><div style={{ fontWeight: '500' }}>{s.full_name}</div><div style={{ fontSize: '12px', color: '#64748B' }}>{getSourceLabel(s.source)}</div></div>
                </div>
                <div><div style={{ fontSize: '13px' }}>{s.phone}</div><div style={{ fontSize: '12px', color: '#64748B' }}>{s.email}</div></div>
                <div style={{ fontSize: '13px' }}>{s.course_name}</div>
                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: '500' }}>{formatCurrency(s.final_fee)}</div>
                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: '500', color: '#10B981' }}>{formatCurrency(s.paid_amount)}</div>
                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: '500', color: s.remaining_amount > 0 ? '#EF4444' : '#10B981' }}>{formatCurrency(s.remaining_amount)}</div>
                <div><span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '500', background: `${PAYMENT_COLORS[s.payment_status]}22`, color: PAYMENT_COLORS[s.payment_status] }}>{getPaymentStatusLabel(s.payment_status)}</span></div>
                <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                  <button className="action-btn edit" onClick={() => openEditModal('student', s)}>✏️</button>
                  <button className="action-btn delete" onClick={() => handleDelete('student', s.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EMPLOYEES TAB */}
      {activeTab === 'employees' && (
        <div className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>👥 Quản lý Nhân sự ({employees.length})</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select className="filter-select" value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)}>
                <option value="all">Tất cả phòng ban</option>
                <option value="AI Training">AI Training</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
              </select>
              <button onClick={() => openAddModal('employee')} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', border: 'none', borderRadius: '10px', color: 'white', fontFamily: 'inherit', fontSize: '14px', cursor: 'pointer' }}>➕ Thêm nhân viên</button>
            </div>
          </div>
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div className="table-row" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 120px', background: 'rgba(15, 23, 42, 0.5)', fontWeight: '600', fontSize: '13px', color: '#94A3B8', textTransform: 'uppercase' }}>
              <div>Nhân viên</div><div>Phòng ban</div><div>Trạng thái</div><div>Workload</div><div>Performance</div><div>Lương</div><div>Thao tác</div>
            </div>
            {filteredEmployees.map(emp => (
              <div key={emp.id} className="table-row" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 120px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `linear-gradient(135deg, ${COLORS[emp.id % COLORS.length]}44, ${COLORS[emp.id % COLORS.length]}22)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: COLORS[emp.id % COLORS.length] }}>{emp.name?.charAt(0)}</div>
                  <div><div style={{ fontWeight: '500' }}>{emp.name}</div><div style={{ fontSize: '13px', color: '#94A3B8' }}>{emp.role}</div></div>
                </div>
                <div>{emp.department}</div>
                <div><span className="status-badge" style={{ background: emp.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: emp.status === 'active' ? '#10B981' : '#F59E0B' }}>{emp.status === 'active' ? 'Đang làm' : 'Nghỉ phép'}</span></div>
                <div><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div className="progress-bar" style={{ flex: 1 }}><div className="progress-fill" style={{ width: `${emp.workload}%`, background: emp.workload > 80 ? '#EF4444' : '#10B981' }}></div></div><span style={{ fontSize: '13px' }}>{emp.workload}%</span></div></div>
                <div><span style={{ color: emp.performance >= 90 ? '#10B981' : '#F59E0B', fontWeight: '600' }}>{emp.performance}%</span></div>
                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: '500' }}>{((emp.salary || 0) / 1000000).toFixed(0)}M</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="action-btn edit" onClick={() => openEditModal('employee', emp)}>✏️</button>
                  <button className="action-btn delete" onClick={() => handleDelete('employee', emp.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COURSES TAB */}
      {activeTab === 'courses' && (
        <div className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>📚 Quản lý Khóa học ({courses.length})</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select className="filter-select" value={filterCourseStatus} onChange={e => setFilterCourseStatus(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang diễn ra</option>
                <option value="upcoming">Sắp tới</option>
                <option value="completed">Hoàn thành</option>
              </select>
              <button onClick={() => openAddModal('course')} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', border: 'none', borderRadius: '10px', color: 'white', fontFamily: 'inherit', fontSize: '14px', cursor: 'pointer' }}>➕ Thêm khóa học</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            {filteredCourses.map((course, index) => (
              <div key={course.id} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div><span className="status-badge" style={{ background: course.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : course.status === 'upcoming' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(148, 163, 184, 0.2)', color: course.status === 'active' ? '#10B981' : course.status === 'upcoming' ? '#3B82F6' : '#94A3B8', marginBottom: '8px', display: 'inline-block' }}>{course.status === 'active' ? 'Đang diễn ra' : course.status === 'upcoming' ? 'Sắp tới' : 'Hoàn thành'}</span><h4 style={{ margin: '8px 0 4px 0', fontSize: '16px', fontWeight: '600' }}>{course.name}</h4><p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>👤 {course.instructor}</p></div>
                  <div style={{ display: 'flex', gap: '8px' }}><button className="action-btn edit" onClick={() => openEditModal('course', course)}>✏️</button><button className="action-btn delete" onClick={() => handleDelete('course', course.id)}>🗑️</button></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}><div><div style={{ fontSize: '12px', color: '#94A3B8' }}>Học viên</div><div style={{ fontSize: '18px', fontWeight: '600' }}>{course.students}</div></div><div><div style={{ fontSize: '12px', color: '#94A3B8' }}>Doanh thu</div><div style={{ fontSize: '18px', fontWeight: '600', color: '#10B981' }}>{formatCurrency(course.revenue)}</div></div></div>
                <div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ fontSize: '13px', color: '#94A3B8' }}>Tiến độ</span><span style={{ fontSize: '13px', fontWeight: '500' }}>{course.progress}%</span></div><div className="progress-bar"><div className="progress-fill" style={{ width: `${course.progress}%`, background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})` }}></div></div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FINANCE TAB */}
      {activeTab === 'finance' && (
        <div className="animate-in">
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>💰 Tình hình Tài chính</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="kpi-card" style={{ '--accent-color': '#10B981' }}><p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Học phí đã thu</p><h2 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#10B981' }}>{formatCurrency(studentStats.totalPaid)}</h2></div>
            <div className="kpi-card" style={{ '--accent-color': '#EF4444' }}><p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Học phí còn nợ</p><h2 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#EF4444' }}>{formatCurrency(studentStats.totalRemaining)}</h2></div>
            <div className="kpi-card" style={{ '--accent-color': '#3B82F6' }}><p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Doanh thu Courses</p><h2 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#3B82F6' }}>{totalRevenue}M</h2></div>
            <div className="kpi-card" style={{ '--accent-color': '#8B5CF6' }}><p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Tỷ lệ thu HP</p><h2 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#8B5CF6' }}>{studentStats.totalTuition > 0 ? Math.round(studentStats.totalPaid / studentStats.totalTuition * 100) : 0}%</h2></div>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Doanh thu vs Chi phí</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData.actual}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" /><XAxis dataKey="month" stroke="#64748B" fontSize={12} /><YAxis stroke="#64748B" fontSize={12} /><Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px' }} /><Legend /><Bar dataKey="revenue" fill="#10B981" name="Doanh thu" radius={[4, 4, 0, 0]} /><Bar dataKey="expenses" fill="#EF4444" name="Chi phí" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SALES TAB */}
      {activeTab === 'sales' && (
        <div className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>🎯 Sales Pipeline ({leads.length} leads)</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select className="filter-select" value={filterStage} onChange={e => setFilterStage(e.target.value)}>
                <option value="all">Tất cả giai đoạn</option>
                <option value="discovery">Khám phá</option>
                <option value="qualification">Đánh giá</option>
                <option value="proposal">Đề xuất</option>
                <option value="negotiation">Đàm phán</option>
                <option value="closed-won">Thành công</option>
              </select>
              <button onClick={() => openAddModal('lead')} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', border: 'none', borderRadius: '10px', color: 'white', fontFamily: 'inherit', fontSize: '14px', cursor: 'pointer' }}>➕ Thêm Lead</button>
            </div>
          </div>

          {/* Pipeline Funnel */}
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Sales Funnel</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '600px', margin: '0 auto' }}>
              {pipelineStages.map((stage, index) => {
                const width = 100 - (index * 15);
                return (<div key={stage.key} style={{ width: `${width}%`, margin: '0 auto', padding: '16px 24px', background: `linear-gradient(90deg, ${COLORS[index]}dd, ${COLORS[index]}88)`, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', fontWeight: '500' }}><span>{stage.name}</span><span>{stage.deals} deals • {stage.amount}M VNĐ</span></div>);
              })}
            </div>
          </div>

          {/* Leads Table */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div className="table-row" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 100px', background: 'rgba(15, 23, 42, 0.5)', fontWeight: '600', fontSize: '13px', color: '#94A3B8', textTransform: 'uppercase' }}>
              <div>Công ty</div><div>Liên hệ</div><div>Giá trị</div><div>Giai đoạn</div><div>Xác suất</div><div>Thao tác</div>
            </div>
            {filteredLeads.map(lead => (
              <div key={lead.id} className="table-row" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 100px' }}>
                <div style={{ fontWeight: '500' }}>{lead.company}</div>
                <div><div>{lead.contact}</div><div style={{ fontSize: '12px', color: '#64748B' }}>{lead.email}</div></div>
                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: '600', color: '#10B981' }}>{formatCurrency(lead.value)}</div>
                <div><span className="status-badge" style={{ background: `${STAGE_COLORS[lead.stage]}22`, color: STAGE_COLORS[lead.stage] }}>{getStageLabel(lead.stage)}</span></div>
                <div><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div className="progress-bar" style={{ width: '60px' }}><div className="progress-fill" style={{ width: `${lead.probability}%`, background: lead.probability >= 70 ? '#10B981' : '#F59E0B' }}></div></div><span style={{ fontSize: '13px' }}>{lead.probability}%</span></div></div>
                <div style={{ display: 'flex', gap: '8px' }}><button className="action-btn edit" onClick={() => openEditModal('lead', lead)}>✏️</button><button className="action-btn delete" onClick={() => handleDelete('lead', lead.id)}>🗑️</button></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '40px', padding: '20px', textAlign: 'center', borderTop: '1px solid rgba(148, 163, 184, 0.1)', color: '#64748B', fontSize: '13px' }}>© 2025 AI Workforce Solutions • Dashboard v3.0 • Built for AIWS</div>

      {/* Modals */}
      <Modal isOpen={modalType === 'employee'} onClose={closeModal} title={editingItem ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}>
        {renderEmployeeForm()}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}><button onClick={closeModal} style={{ padding: '10px 20px', background: 'rgba(148, 163, 184, 0.2)', border: 'none', borderRadius: '8px', color: '#F1F5F9', cursor: 'pointer', fontFamily: 'inherit' }}>Hủy</button><button onClick={handleSave} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>💾 Lưu</button></div>
      </Modal>

      <Modal isOpen={modalType === 'course'} onClose={closeModal} title={editingItem ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}>
        {renderCourseForm()}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}><button onClick={closeModal} style={{ padding: '10px 20px', background: 'rgba(148, 163, 184, 0.2)', border: 'none', borderRadius: '8px', color: '#F1F5F9', cursor: 'pointer', fontFamily: 'inherit' }}>Hủy</button><button onClick={handleSave} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>💾 Lưu</button></div>
      </Modal>

      <Modal isOpen={modalType === 'lead'} onClose={closeModal} title={editingItem ? 'Chỉnh sửa Lead' : 'Thêm Lead mới'}>
        {renderLeadForm()}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}><button onClick={closeModal} style={{ padding: '10px 20px', background: 'rgba(148, 163, 184, 0.2)', border: 'none', borderRadius: '8px', color: '#F1F5F9', cursor: 'pointer', fontFamily: 'inherit' }}>Hủy</button><button onClick={handleSave} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>💾 Lưu</button></div>
      </Modal>

      <Modal isOpen={modalType === 'student'} onClose={closeModal} title={editingItem ? 'Chỉnh sửa học viên' : 'Thêm học viên mới'} wide>
        {renderStudentForm()}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}><button onClick={closeModal} style={{ padding: '10px 20px', background: 'rgba(148, 163, 184, 0.2)', border: 'none', borderRadius: '8px', color: '#F1F5F9', cursor: 'pointer', fontFamily: 'inherit' }}>Hủy</button><button onClick={handleSave} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>💾 Lưu</button></div>
      </Modal>

      {/* Student Detail Modal */}
      {viewStudent && <StudentDetailModal student={viewStudent} onClose={() => setViewStudent(null)} />}
    </div>
  );
}
