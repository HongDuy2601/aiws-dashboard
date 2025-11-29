import React, { useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0D9488', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981'];
const PAYMENT_STATUS_COLORS = {
  'paid': '#10B981',
  'partial': '#F59E0B',
  'unpaid': '#EF4444'
};
const STUDENT_STATUS_COLORS = {
  'active': '#10B981',
  'completed': '#3B82F6',
  'dropped': '#EF4444',
  'paused': '#F59E0B',
  'transferred': '#8B5CF6'
};

const formatCurrency = (value) => {
  if (!value) return '0';
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toLocaleString('vi-VN');
};

const getPaymentStatusLabel = (status) => {
  const labels = {
    'paid': 'Đã đóng đủ',
    'partial': 'Đóng 1 phần',
    'unpaid': 'Chưa đóng'
  };
  return labels[status] || status;
};

const getStudentStatusLabel = (status) => {
  const labels = {
    'active': 'Đang học',
    'completed': 'Hoàn thành',
    'dropped': 'Nghỉ học',
    'paused': 'Tạm dừng',
    'transferred': 'Chuyển lớp'
  };
  return labels[status] || status;
};

const getSourceLabel = (source) => {
  const labels = {
    'Facebook': 'Facebook',
    'Website': 'Website',
    'Referral': 'Giới thiệu',
    'Event': 'Sự kiện',
    'Zalo': 'Zalo',
    'TikTok': 'TikTok',
    'Google': 'Google Ads',
    'LinkedIn': 'LinkedIn',
    'Cold Call': 'Cold Call',
    'Other': 'Khác'
  };
  return labels[source] || source;
};

// Form Input Component
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
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer'
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
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'text'
        }}
      />
    )}
  </div>
);

// Student Detail Modal
const StudentDetailModal = ({ student, onClose, courses }) => {
  if (!student) return null;

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
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(148, 163, 184, 0.2)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Chi tiết Học viên</h2>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            fontSize: '24px',
            cursor: 'pointer'
          }}>×</button>
        </div>

        {/* Header Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '20px',
          background: 'rgba(13, 148, 136, 0.1)',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0D9488, #0F766E)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '700',
            color: 'white'
          }}>
            {student.full_name?.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{student.full_name}</h3>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '14px' }}>{student.course_name}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              background: `${STUDENT_STATUS_COLORS[student.student_status]}22`,
              color: STUDENT_STATUS_COLORS[student.student_status]
            }}>
              {getStudentStatusLabel(student.student_status)}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          {/* Personal Info */}
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Thông tin cá nhân
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              <InfoRow label="Số điện thoại" value={student.phone} />
              <InfoRow label="Email" value={student.email} />
              <InfoRow label="Ngày sinh" value={student.date_of_birth} />
              <InfoRow label="Giới tính" value={student.gender === 'male' ? 'Nam' : student.gender === 'female' ? 'Nữ' : student.gender} />
              <InfoRow label="Địa chỉ" value={student.address} />
              <InfoRow label="Thành phố" value={student.city} />
              <InfoRow label="Nghề nghiệp" value={student.occupation} />
              <InfoRow label="Công ty" value={student.company} />
            </div>
          </div>

          {/* Financial Info */}
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Thông tin học phí
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              <InfoRow label="Học phí gốc" value={formatCurrency(student.tuition_fee) + ' VNĐ'} />
              <InfoRow label="Giảm giá" value={formatCurrency(student.discount_amount) + ' VNĐ'} color="#F59E0B" />
              <InfoRow label="Phải đóng" value={formatCurrency(student.final_fee) + ' VNĐ'} />
              <InfoRow label="Đã đóng" value={formatCurrency(student.paid_amount) + ' VNĐ'} color="#10B981" />
              <InfoRow label="Còn lại" value={formatCurrency(student.remaining_amount) + ' VNĐ'} color={student.remaining_amount > 0 ? '#EF4444' : '#10B981'} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>Trạng thái</span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: `${PAYMENT_STATUS_COLORS[student.payment_status]}22`,
                  color: PAYMENT_STATUS_COLORS[student.payment_status]
                }}>
                  {getPaymentStatusLabel(student.payment_status)}
                </span>
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Thông tin khóa học
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              <InfoRow label="Khóa học" value={student.course_name} />
              <InfoRow label="Ngày đăng ký" value={student.enrollment_date} />
              <InfoRow label="Ngày bắt đầu" value={student.start_date} />
              <InfoRow label="Giảng viên" value={student.assigned_instructor} />
              <InfoRow label="Điểm danh" value={`${student.attendance_rate || 0}%`} />
              <InfoRow label="Tiến độ học" value={`${student.progress || 0}%`} />
            </div>
          </div>

          {/* Marketing Info */}
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Nguồn & Marketing
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              <InfoRow label="Nguồn" value={getSourceLabel(student.source)} />
              <InfoRow label="Người giới thiệu" value={student.referral_by} />
              <InfoRow label="Chiến dịch" value={student.campaign} />
              <InfoRow label="UTM Source" value={student.utm_source} />
            </div>
          </div>
        </div>

        {/* Notes */}
        {student.notes && (
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '20px', marginTop: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Ghi chú
            </h4>
            <p style={{ margin: 0, color: '#F1F5F9', fontSize: '14px', lineHeight: '1.6' }}>{student.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: '13px', color: '#94A3B8' }}>{label}</span>
    <span style={{ fontSize: '14px', fontWeight: '500', color: color || '#F1F5F9' }}>{value || '—'}</span>
  </div>
);

// Main Students Tab Component
export default function StudentsTab({ 
  students, 
  courses, 
  onAdd, 
  onEdit, 
  onDelete,
  formData,
  setFormData,
  editingItem,
  saving
}) {
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewStudent, setViewStudent] = useState(null);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({});

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (filterCourse !== 'all' && s.course_id?.toString() !== filterCourse) return false;
      if (filterPayment !== 'all' && s.payment_status !== filterPayment) return false;
      if (filterStatus !== 'all' && s.student_status !== filterStatus) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          s.full_name?.toLowerCase().includes(query) ||
          s.phone?.includes(query) ||
          s.email?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [students, filterCourse, filterPayment, filterStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter(s => s.student_status === 'active').length;
    const totalTuition = students.reduce((sum, s) => sum + (s.final_fee || s.tuition_fee || 0), 0);
    const totalPaid = students.reduce((sum, s) => sum + (s.paid_amount || 0), 0);
    const totalRemaining = students.reduce((sum, s) => sum + (s.remaining_amount || 0), 0);
    const paidFull = students.filter(s => s.payment_status === 'paid').length;
    const partial = students.filter(s => s.payment_status === 'partial').length;
    const unpaid = students.filter(s => s.payment_status === 'unpaid').length;

    return { total, active, totalTuition, totalPaid, totalRemaining, paidFull, partial, unpaid };
  }, [students]);

  // Source distribution
  const sourceDistribution = useMemo(() => {
    const sources = {};
    students.forEach(s => {
      const src = s.source || 'Khác';
      sources[src] = (sources[src] || 0) + 1;
    });
    return Object.entries(sources).map(([name, value]) => ({ name: getSourceLabel(name), value }));
  }, [students]);

  // Payment status distribution
  const paymentDistribution = useMemo(() => {
    return [
      { name: 'Đã đóng đủ', value: stats.paidFull, color: '#10B981' },
      { name: 'Đóng 1 phần', value: stats.partial, color: '#F59E0B' },
      { name: 'Chưa đóng', value: stats.unpaid, color: '#EF4444' },
    ];
  }, [stats]);

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Quản lý Học viên ({students.length})</h3>
        <button onClick={onAdd} style={{
          padding: '10px 16px',
          background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
          border: 'none',
          borderRadius: '10px',
          color: 'white',
          fontFamily: 'inherit',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ➕ Thêm học viên
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#0D9488', fontFamily: '"Space Grotesk", sans-serif' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '13px', color: '#94A3B8' }}>Tổng học viên</div>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#3B82F6', fontFamily: '"Space Grotesk", sans-serif' }}>
            {stats.active}
          </div>
          <div style={{ fontSize: '13px', color: '#94A3B8' }}>Đang học</div>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#10B981', fontFamily: '"Space Grotesk", sans-serif' }}>
            {formatCurrency(stats.totalPaid)}
          </div>
          <div style={{ fontSize: '13px', color: '#94A3B8' }}>Đã thu</div>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#EF4444', fontFamily: '"Space Grotesk", sans-serif' }}>
            {formatCurrency(stats.totalRemaining)}
          </div>
          <div style={{ fontSize: '13px', color: '#94A3B8' }}>Còn nợ</div>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#F59E0B', fontFamily: '"Space Grotesk", sans-serif' }}>
            {stats.totalTuition > 0 ? Math.round(stats.totalPaid / stats.totalTuition * 100) : 0}%
          </div>
          <div style={{ fontSize: '13px', color: '#94A3B8' }}>Tỷ lệ thu</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Source Distribution */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600' }}>Nguồn học viên</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sourceDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label>
                {sourceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600' }}>Trạng thái thanh toán</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={paymentDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis type="number" stroke="#64748B" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={12} width={100} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {paymentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên, SĐT, email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            padding: '10px 16px',
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '10px',
            color: '#F1F5F9',
            fontSize: '14px',
            outline: 'none',
            minWidth: '250px'
          }}
        />
        <select className="filter-select" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option value="all">Tất cả khóa học</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select className="filter-select" value={filterPayment} onChange={e => setFilterPayment(e.target.value)}>
          <option value="all">Tất cả thanh toán</option>
          <option value="paid">Đã đóng đủ</option>
          <option value="partial">Đóng 1 phần</option>
          <option value="unpaid">Chưa đóng</option>
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang học</option>
          <option value="completed">Hoàn thành</option>
          <option value="dropped">Nghỉ học</option>
          <option value="paused">Tạm dừng</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div className="table-row" style={{ 
          gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr 120px',
          background: 'rgba(15, 23, 42, 0.5)',
          fontWeight: '600',
          fontSize: '13px',
          color: '#94A3B8',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <div>Học viên</div>
          <div>Liên hệ</div>
          <div>Khóa học</div>
          <div>Học phí</div>
          <div>Đã đóng</div>
          <div>Còn lại</div>
          <div>Trạng thái</div>
          <div>Thao tác</div>
        </div>
        
        {filteredStudents.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
            Không có học viên nào phù hợp với bộ lọc
          </div>
        ) : (
          filteredStudents.map(student => (
            <div 
              key={student.id} 
              className="table-row"
              style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr 120px', cursor: 'pointer' }}
              onClick={() => setViewStudent(student)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${COLORS[student.id % COLORS.length]}44, ${COLORS[student.id % COLORS.length]}22)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  color: COLORS[student.id % COLORS.length]
                }}>
                  {student.full_name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: '500' }}>{student.full_name}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{getSourceLabel(student.source)}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '13px' }}>{student.phone}</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>{student.email}</div>
              </div>
              <div style={{ fontSize: '13px' }}>{student.course_name}</div>
              <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: '500' }}>
                {formatCurrency(student.final_fee || student.tuition_fee)}
              </div>
              <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: '500', color: '#10B981' }}>
                {formatCurrency(student.paid_amount)}
              </div>
              <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: '500', color: student.remaining_amount > 0 ? '#EF4444' : '#10B981' }}>
                {formatCurrency(student.remaining_amount)}
              </div>
              <div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '500',
                  background: `${PAYMENT_STATUS_COLORS[student.payment_status]}22`,
                  color: PAYMENT_STATUS_COLORS[student.payment_status]
                }}>
                  {getPaymentStatusLabel(student.payment_status)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                <button className="action-btn edit" onClick={() => onEdit(student)}>✏️</button>
                <button className="action-btn delete" onClick={() => onDelete(student.id)}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Detail Modal */}
      {viewStudent && (
        <StudentDetailModal 
          student={viewStudent} 
          onClose={() => setViewStudent(null)}
          courses={courses}
        />
      )}
    </div>
  );
}

// Export the student form renderer
export const renderStudentForm = (formData, setFormData, courses) => (
  <>
    <div style={{ 
      background: 'rgba(13, 148, 136, 0.1)', 
      borderRadius: '8px', 
      padding: '12px 16px', 
      marginBottom: '20px',
      fontSize: '13px',
      color: '#0D9488'
    }}>
      💡 Các trường có dấu <span style={{ color: '#EF4444' }}>*</span> là bắt buộc
    </div>

    {/* Section: Thông tin cá nhân */}
    <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94A3B8', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '8px' }}>
      👤 Thông tin cá nhân
    </h4>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <FormInput label="Họ và tên" value={formData.full_name || ''} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
      <FormInput label="Số điện thoại" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} required />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <FormInput label="Email" type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
      <FormInput label="Ngày sinh" type="date" value={formData.date_of_birth || ''} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
      <FormInput 
        label="Giới tính" 
        type="select" 
        value={formData.gender || ''} 
        onChange={e => setFormData({...formData, gender: e.target.value})}
        options={[
          { value: 'male', label: 'Nam' },
          { value: 'female', label: 'Nữ' },
          { value: 'other', label: 'Khác' },
        ]}
      />
      <FormInput label="Nghề nghiệp" value={formData.occupation || ''} onChange={e => setFormData({...formData, occupation: e.target.value})} />
      <FormInput label="Công ty" value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
      <FormInput label="Địa chỉ" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
      <FormInput label="Thành phố" value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="VD: Hồ Chí Minh" />
    </div>

    {/* Section: Thông tin khóa học */}
    <h4 style={{ margin: '24px 0 16px 0', fontSize: '14px', color: '#94A3B8', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '8px' }}>
      📚 Thông tin khóa học
    </h4>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <FormInput 
        label="Khóa học" 
        type="select" 
        value={formData.course_id || ''} 
        onChange={e => {
          const course = courses.find(c => c.id.toString() === e.target.value);
          setFormData({
            ...formData, 
            course_id: e.target.value,
            course_name: course?.name || '',
            assigned_instructor: course?.instructor || ''
          });
        }}
        options={courses.map(c => ({ value: c.id, label: c.name }))}
        required
      />
      <FormInput label="Giảng viên" value={formData.assigned_instructor || ''} onChange={e => setFormData({...formData, assigned_instructor: e.target.value})} disabled />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
      <FormInput label="Ngày đăng ký" type="date" value={formData.enrollment_date || ''} onChange={e => setFormData({...formData, enrollment_date: e.target.value})} />
      <FormInput label="Ngày bắt đầu" type="date" value={formData.start_date || ''} onChange={e => setFormData({...formData, start_date: e.target.value})} />
      <FormInput 
        label="Trạng thái" 
        type="select" 
        value={formData.student_status || 'active'} 
        onChange={e => setFormData({...formData, student_status: e.target.value})}
        options={[
          { value: 'active', label: 'Đang học' },
          { value: 'completed', label: 'Hoàn thành' },
          { value: 'dropped', label: 'Nghỉ học' },
          { value: 'paused', label: 'Tạm dừng' },
          { value: 'transferred', label: 'Chuyển lớp' },
        ]}
      />
    </div>

    {/* Section: Thông tin học phí */}
    <h4 style={{ margin: '24px 0 16px 0', fontSize: '14px', color: '#94A3B8', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '8px' }}>
      💰 Thông tin học phí
    </h4>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
      <FormInput 
        label="Học phí gốc (VNĐ)" 
        type="number" 
        value={formData.tuition_fee || ''} 
        onChange={e => {
          const tuition = parseInt(e.target.value) || 0;
          const discount = parseInt(formData.discount_amount) || 0;
          setFormData({
            ...formData, 
            tuition_fee: tuition,
            final_fee: tuition - discount
          });
        }} 
        required 
      />
      <FormInput 
        label="Giảm giá (VNĐ)" 
        type="number" 
        value={formData.discount_amount || ''} 
        onChange={e => {
          const discount = parseInt(e.target.value) || 0;
          const tuition = parseInt(formData.tuition_fee) || 0;
          setFormData({
            ...formData, 
            discount_amount: discount,
            final_fee: tuition - discount
          });
        }} 
      />
      <FormInput 
        label="Phải đóng (VNĐ)" 
        type="number" 
        value={formData.final_fee || ''} 
        disabled 
      />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
      <FormInput 
        label="Đã đóng (VNĐ)" 
        type="number" 
        value={formData.paid_amount || ''} 
        onChange={e => setFormData({...formData, paid_amount: parseInt(e.target.value) || 0})} 
      />
      <FormInput 
        label="Phương thức TT" 
        type="select" 
        value={formData.payment_method || ''} 
        onChange={e => setFormData({...formData, payment_method: e.target.value})}
        options={[
          { value: 'cash', label: 'Tiền mặt' },
          { value: 'transfer', label: 'Chuyển khoản' },
          { value: 'card', label: 'Thẻ' },
          { value: 'installment', label: 'Trả góp' },
        ]}
      />
      <FormInput label="Lý do giảm giá" value={formData.discount_reason || ''} onChange={e => setFormData({...formData, discount_reason: e.target.value})} placeholder="VD: Đăng ký sớm" />
    </div>

    {/* Section: Nguồn & Marketing */}
    <h4 style={{ margin: '24px 0 16px 0', fontSize: '14px', color: '#94A3B8', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '8px' }}>
      📢 Nguồn & Marketing
    </h4>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
      <FormInput 
        label="Nguồn" 
        type="select" 
        value={formData.source || ''} 
        onChange={e => setFormData({...formData, source: e.target.value})}
        options={[
          { value: 'Facebook', label: 'Facebook' },
          { value: 'Website', label: 'Website' },
          { value: 'Referral', label: 'Giới thiệu' },
          { value: 'Event', label: 'Sự kiện' },
          { value: 'Zalo', label: 'Zalo' },
          { value: 'TikTok', label: 'TikTok' },
          { value: 'Google', label: 'Google Ads' },
          { value: 'LinkedIn', label: 'LinkedIn' },
          { value: 'Cold Call', label: 'Cold Call' },
          { value: 'Other', label: 'Khác' },
        ]}
      />
      <FormInput label="Người giới thiệu" value={formData.referral_by || ''} onChange={e => setFormData({...formData, referral_by: e.target.value})} placeholder="Tên người giới thiệu" />
      <FormInput label="Chiến dịch" value={formData.campaign || ''} onChange={e => setFormData({...formData, campaign: e.target.value})} placeholder="VD: Campaign T1/2025" />
    </div>

    {/* Section: Ghi chú */}
    <h4 style={{ margin: '24px 0 16px 0', fontSize: '14px', color: '#94A3B8', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '8px' }}>
      📝 Ghi chú
    </h4>
    <FormInput 
      label="Ghi chú" 
      type="textarea" 
      value={formData.notes || ''} 
      onChange={e => setFormData({...formData, notes: e.target.value})} 
      placeholder="Thông tin thêm về học viên, yêu cầu đặc biệt, v.v..." 
    />
  </>
);
