import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import { db } from './supabaseClient';

// Constants
const COLORS = ['#0D9488', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981'];
const STAGE_COLORS = { 'discovery': '#94A3B8', 'qualification': '#60A5FA', 'proposal': '#F59E0B', 'negotiation': '#8B5CF6', 'closed-won': '#10B981', 'closed-lost': '#EF4444' };
const PAYMENT_COLORS = { 'paid': '#10B981', 'partial': '#F59E0B', 'unpaid': '#EF4444' };

// Helper functions
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

// Modal Component
const Modal = ({ isOpen, onClose, title, children, wide }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={onClose}>
      <div style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', borderRadius: '16px', padding: '24px', maxWidth: wide ? '900px' : '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(148, 163, 184, 0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Form Input Component
const FormInput = ({ label, type = 'text', value, onChange, options, required, placeholder, disabled }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94A3B8' }}>
      {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
    </label>
    {type === 'select' ? (
      <select value={value} onChange={onChange} required={required} disabled={disabled}
        style={{ width: '100%', padding: '10px 12px', background: disabled ? 'rgba(15, 23, 42, 0.5)' : 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px', color: '#F1F5F9', fontSize: '14px', outline: 'none' }}>
        <option value="">Chọn...</option>
        {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    ) : type === 'textarea' ? (
      <textarea value={value} onChange={onChange} required={required} placeholder={placeholder} rows={3}
        style={{ width: '100%', padding: '10px 12px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px', color: '#F1F5F9', fontSize: '14px', outline: 'none', resize: 'vertical' }} />
    ) : (
      <input type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} disabled={disabled}
        style={{ width: '100%', padding: '10px 12px', background: disabled ? 'rgba(15, 23, 42, 0.5)' : 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px', color: '#F1F5F9', fontSize: '14px', outline: 'none' }} />
    )}
  </div>
);

// Main Dashboard Component
export default function AIWSDashboard({ user, onLogout }) {
  const [employees, setEmployees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [leads, setLeads] = useState([]);
  const [students, setStudents] = useState([]);
  const [financialData, setFinancialData] = useState({ actual: [], forecast: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [formData, setFormData] = useState({});
  const [viewStudent, setViewStudent] = useState(null);

  // Fetch data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [empRes, courseRes, leadRes, studentRes, finRes] = await Promise.all([
        db.employees.getAll(),
        db.courses.getAll(),
        db.leads.getAll(),
        db.students.getAll(),
        db.financial.getAll()
      ]);
      if (empRes.data) setEmployees(empRes.data);
      if (courseRes.data) setCourses(courseRes.data);
      if (leadRes.data) setLeads(leadRes.data);
      if (studentRes.data) setStudents(studentRes.data);
      if (finRes.data) {
        const actual = finRes.data.filter(d => !d.is_forecast).map(d => ({ month: d.month, revenue: Number(d.revenue), expenses: Number(d.expenses), profit: Number(d.profit) }));
        const forecast = finRes.data.filter(d => d.is_forecast).map(d => ({ month: d.month, revenue: Number(d.revenue), expenses: Number(d.expenses), profit: Number(d.profit) }));
        setFinancialData({ actual, forecast });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // CRUD functions
  const openAddModal = (type) => { setModalType(type); setEditingItem(null); setFormData({}); };
  const openEditModal = (type, item) => { setModalType(type); setEditingItem(item); setFormData(item); };
  const closeModal = () => { setModalType(null); setEditingItem(null); setFormData({}); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modalType === 'employee') {
        const data = { name: formData.name, role: formData.role, department: formData.department, status: formData.status || 'active', workload: parseInt(formData.workload) || 0, performance: parseInt(formData.performance) || 0, salary: parseInt(formData.salary) || 0 };
        if (editingItem) await db.employees.update(editingItem.id, data);
        else await db.employees.create(data);
        const { data: newData } = await db.employees.getAll();
        if (newData) setEmployees(newData);
      } else if (modalType === 'course') {
        const data = { name: formData.name, instructor: formData.instructor, category: formData.category, start_date: formData.start_date, end_date: formData.end_date, students: parseInt(formData.students) || 0, progress: parseInt(formData.progress) || 0, revenue: parseInt(formData.revenue) || 0, status: formData.status || 'upcoming' };
        if (editingItem) await db.courses.update(editingItem.id, data);
        else await db.courses.create(data);
        const { data: newData } = await db.courses.getAll();
        if (newData) setCourses(newData);
      } else if (modalType === 'lead') {
        const data = { company: formData.company, contact: formData.contact, email: formData.email, phone: formData.phone, value: parseInt(formData.value) || 0, stage: formData.stage || 'discovery', probability: parseInt(formData.probability) || 0, source: formData.source, notes: formData.notes };
        if (editingItem) await db.leads.update(editingItem.id, data);
        else await db.leads.create(data);
        const { data: newData } = await db.leads.getAll();
        if (newData) setLeads(newData);
      } else if (modalType === 'student') {
        const data = {
          full_name: formData.full_name, phone: formData.phone, email: formData.email, date_of_birth: formData.date_of_birth, gender: formData.gender, address: formData.address,
          course_id: parseInt(formData.course_id) || null, course_name: formData.course_name, enrollment_date: formData.enrollment_date || new Date().toISOString().split('T')[0],
          tuition_fee: parseInt(formData.tuition_fee) || 0, discount_amount: parseInt(formData.discount_amount) || 0, paid_amount: parseInt(formData.paid_amount) || 0,
          payment_method: formData.payment_method, source: formData.source, student_status: formData.student_status || 'active', assigned_instructor: formData.assigned_instructor, notes: formData.notes
        };
        if (editingItem) await db.students.update(editingItem.id, data);
        else await db.students.create(data);
        const { data: newData } = await db.students.getAll();
        if (newData) setStudents(newData);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Lỗi khi lưu: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    try {
      if (type === 'employee') { await db.employees.delete(id); setEmployees(employees.filter(e => e.id !== id)); }
      else if (type === 'course') { await db.courses.delete(id); setCourses(courses.filter(c => c.id !== id)); }
      else if (type === 'lead') { await db.leads.delete(id); setLeads(leads.filter(l => l.id !== id)); }
      else if (type === 'student') { await db.students.delete(id); setStudents(students.filter(s => s.id !== id)); }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  // Export to Excel
  const exportToExcel = (type) => {
    let data, fileName;
    switch(type) {
      case 'students':
        data = students.map(s => ({ 'Họ tên': s.full_name, 'SĐT': s.phone, 'Email': s.email, 'Khóa học': s.course_name, 'Học phí': s.tuition_fee, 'Đã đóng': s.paid_amount, 'Còn lại': s.remaining_amount }));
        fileName = 'AIWS_HocVien';
        break;
      case 'employees':
        data = employees.map(e => ({ 'Họ tên': e.name, 'Chức vụ': e.role, 'Phòng ban': e.department, 'Lương': e.salary }));
        fileName = 'AIWS_NhanSu';
        break;
      case 'courses':
        data = courses.map(c => ({ 'Tên': c.name, 'Giảng viên': c.instructor, 'Học viên': c.students, 'Doanh thu': c.revenue }));
        fileName = 'AIWS_KhoaHoc';
        break;
      case 'leads':
        data = leads.map(l => ({ 'Công ty': l.company, 'Liên hệ': l.contact, 'Giá trị': l.value, 'Giai đoạn': getStageLabel(l.stage) }));
        fileName = 'AIWS_Leads';
        break;
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
    const totalTuition = students.reduce((sum, s) => sum + (s.final_fee || s.tuition_fee || 0), 0);
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
    { id: 'sales', label: 'Sales', icon: '🎯' },
  ];

  // Form renderers
  const renderEmployeeForm = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput label="Họ tên" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
        <FormInput label="Chức vụ" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} />
      </div>
      <FormInput label="Phòng ban" type="select" value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} options={[{ value: 'AI Training', label: 'AI Training' }, { value: 'Digital Marketing', label: 'Digital Marketing' }, { value: 'E-commerce', label: 'E-commerce' }, { value: 'Sales', label: 'Sales' }, { value: 'Operations', label: 'Operations' }]} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <FormInput label="Workload (%)" type="number" value={formData.workload || ''} onChange={e => setFormData({...formData, workload: e.target.value})} />
        <FormInput label="Performance (%)" type="number" value={formData.performance || ''} onChange={e => setFormData({...formData, performance: e.target.value})} />
        <FormInput label="Lương (VNĐ)" type="number" value={formData.salary || ''} onChange={e => setFormData({...formData, salary: e.target.value})} />
      </div>
    </>
  );

  const renderCourseForm = () => (
    <>
      <FormInput label="Tên khóa học" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput label="Giảng viên" value={formData.instructor || ''} onChange={e => setFormData({...formData, instructor: e.target.value})} />
        <FormInput label="Danh mục" type="select" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} options={[{ value: 'AI Training', label: 'AI Training' }, { value: 'Digital Marketing', label: 'Digital Marketing' }, { value: 'E-commerce', label: 'E-commerce' }]} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <FormInput label="Số học viên" type="number" value={formData.students || ''} onChange={e => setFormData({...formData, students: e.target.value})} />
        <FormInput label="Tiến độ (%)" type="number" value={formData.progress || ''} onChange={e => setFormData({...formData, progress: e.target.value})} />
        <FormInput label="Doanh thu" type="number" value={formData.revenue || ''} onChange={e => setFormData({...formData, revenue: e.target.value})} />
      </div>
    </>
  );

  const renderLeadForm = () => (
    <>
      <FormInput label="Tên công ty" value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} required />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput label="Người liên hệ" value={formData.contact || ''} onChange={e => setFormData({...formData, contact: e.target.value})} />
        <FormInput label="Giá trị (VNĐ)" type="number" value={formData.value || ''} onChange={e => setFormData({...formData, value: e.target.value})} />
      </div>
      <FormInput label="Giai đoạn" type="select" value={formData.stage || 'discovery'} onChange={e => setFormData({...formData, stage: e.target.value})} options={[{ value: 'discovery', label: 'Khám phá' }, { value: 'qualification', label: 'Đánh giá' }, { value: 'proposal', label: 'Đề xuất' }, { value: 'negotiation', label: 'Đàm phán' }, { value: 'closed-won', label: 'Thành công' }]} />
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
        <FormInput label="Giới tính" type="select" value={formData.gender || ''} onChange={e => setFormData({...formData, gender: e.target.value})} options={[{ value: 'male', label: 'Nam' }, { value: 'female', label: 'Nữ' }]} />
      </div>

      <h4 style={{ margin: '24px 0 16px 0', fontSize: '14px', color: '#94A3B8', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '8px' }}>📚 Khóa học</h4>
      <FormInput label="Khóa học" type="select" value={formData.course_id || ''} onChange={e => {
        const course = courses.find(c => c.id.toString() === e.target.value);
        setFormData({ ...formData, course_id: e.target.value, course_name: course?.name || '', assigned_instructor: course?.instructor || '' });
      }} options={courses.map(c => ({ value: c.id, label: c.name }))} required />

      <h4 style={{ margin: '24px 0 16px 0', fontSize: '14px', color: '#94A3B8', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '8px' }}>💰 Học phí</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <FormInput label="Học phí gốc" type="number" value={formData.tuition_fee || ''} onChange={e => setFormData({...formData, tuition_fee: e.target.value})} required />
        <FormInput label="Giảm giá" type="number" value={formData.discount_amount || ''} onChange={e => setFormData({...formData, discount_amount: e.target.value})} />
        <FormInput label="Đã đóng" type="number" value={formData.paid_amount || ''} onChange={e => setFormData({...formData, paid_amount: e.target.value})} />
      </div>

      <h4 style={{ margin: '24px 0 16px 0', fontSize: '14px', color: '#94A3B8', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '8px' }}>📢 Nguồn</h4>
      <FormInput label="Nguồn" type="select" value={formData.source || ''} onChange={e => setFormData({...formData, source: e.target.value})} options={[{ value: 'Facebook', label: 'Facebook' }, { value: 'Website', label: 'Website' }, { value: 'Referral', label: 'Giới thiệu' }, { value: 'Event', label: 'Sự kiện' }, { value: 'Zalo', label: 'Zalo' }, { value: 'TikTok', label: 'TikTok' }, { value: 'Google', label: 'Google' }, { value: 'LinkedIn', label: 'LinkedIn' }]} />
      <FormInput label="Ghi chú" type="textarea" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} />
    </>
  );

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F1F5F9' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid rgba(13, 148, 136, 0.3)', borderTopColor: '#0D9488', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p>Đang tải dữ liệu...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)', fontFamily: 'system-ui, sans-serif', color: '#F1F5F9', padding: '24px' }}>
      <style>{`
        .glass-card { background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 16px; }
        .kpi-card { background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 16px; padding: 24px; position: relative; overflow: hidden; }
        .kpi-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--accent-color), transparent); }
        .tab-btn { padding: 12px 20px; border: none; background: transparent; color: #94A3B8; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; border-radius: 10px; }
        .tab-btn:hover { background: rgba(148, 163, 184, 0.1); color: #F1F5F9; }
        .tab-btn.active { background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); color: white; }
        .progress-bar { height: 8px; background: rgba(148, 163, 184, 0.2); border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 4px; }
        .table-row { display: grid; padding: 16px; border-bottom: 1px solid rgba(148, 163, 184, 0.1); align-items: center; }
        .table-row:hover { background: rgba(148, 163, 184, 0.05); }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .filter-select { background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(148, 163, 184, 0.2); color: #F1F5F9; padding: 10px 16px; border-radius: 10px; font-size: 14px; cursor: pointer; outline: none; }
        .action-btn { padding: 6px 12px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; }
        .action-btn.edit { background: rgba(59, 130, 246, 0.2); color: #60A5FA; }
        .action-btn.delete { background: rgba(239, 68, 68, 0.2); color: #EF4444; }
        .dropdown-menu { position: absolute; top: 100%; right: 0; margin-top: 8px; background: #1E293B; border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 12px; padding: 8px; min-width: 200px; z-index: 100; }
        .dropdown-item { padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; }
        .dropdown-item:hover { background: rgba(148, 163, 184, 0.1); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #0D9488, #0F766E)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🤖</div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#F1F5F9', margin: 0 }}>AI Workforce Solutions</h1>
          </div>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '14px' }}>Dashboard v3.0 • {new Date().toLocaleDateString('vi-VN')}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setShowExportMenu(!showExportMenu); setShowUserMenu(false); }} style={{ padding: '10px 20px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '10px', color: '#F1F5F9', fontSize: '14px', cursor: 'pointer' }}>📥 Export ▾</button>
            {showExportMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={() => exportToExcel('students')}>🎓 Học viên</div>
                <div className="dropdown-item" onClick={() => exportToExcel('employees')}>👥 Nhân sự</div>
                <div className="dropdown-item" onClick={() => exportToExcel('courses')}>📚 Khóa học</div>
                <div className="dropdown-item" onClick={() => exportToExcel('leads')}>🎯 Leads</div>
              </div>
            )}
          </div>
          <button onClick={() => { if (activeTab === 'students') openAddModal('student'); else if (activeTab === 'employees') openAddModal('employee'); else if (activeTab === 'courses') openAddModal('course'); else if (activeTab === 'sales') openAddModal('lead'); else openAddModal('student'); }} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0D9488, #0F766E)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>➕ Thêm mới</button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setShowUserMenu(!showUserMenu); setShowExportMenu(false); }} style={{ padding: '10px 16px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '10px', color: '#F1F5F9', fontSize: '14px', cursor: 'pointer' }}>👤 {user?.email?.split('@')[0]}</button>
            {showUserMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={fetchAllData}>🔄 Refresh</div>
                <div className="dropdown-item" onClick={onLogout} style={{ color: '#EF4444' }}>🚪 Đăng xuất</div>
              </div>
            )}
          </div>
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
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="kpi-card" style={{ '--accent-color': '#0D9488' }}>
              <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Tổng doanh thu</p>
              <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0 }}>{totalRevenue}M</h2>
            </div>
            <div className="kpi-card" style={{ '--accent-color': '#3B82F6' }}>
              <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Học viên</p>
              <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0 }}>{students.length}</h2>
              <div style={{ color: '#94A3B8', fontSize: '13px', marginTop: '8px' }}>{students.filter(s => s.student_status === 'active').length} đang học</div>
            </div>
            <div className="kpi-card" style={{ '--accent-color': '#10B981' }}>
              <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Đã thu</p>
              <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0, color: '#10B981' }}>{formatCurrency(studentStats.totalPaid)}</h2>
            </div>
            <div className="kpi-card" style={{ '--accent-color': '#EF4444' }}>
              <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Còn nợ</p>
              <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0, color: '#EF4444' }}>{formatCurrency(studentStats.totalRemaining)}</h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px' }}>📈 Doanh thu (Triệu VNĐ)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={[...financialData.actual, ...financialData.forecast]}>
                  <defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0D9488" stopOpacity={0.4}/><stop offset="95%" stopColor="#0D9488" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#0D9488" strokeWidth={2} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px' }}>📊 Phân bổ nhân sự</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={departmentDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                    {departmentDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
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
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>🎓 Quản lý Học viên ({students.length})</h3>
            <button onClick={() => openAddModal('student')} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #0D9488, #0F766E)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', cursor: 'pointer' }}>➕ Thêm học viên</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}><div style={{ fontSize: '28px', fontWeight: '700', color: '#0D9488' }}>{students.length}</div><div style={{ fontSize: '13px', color: '#94A3B8' }}>Tổng</div></div>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}><div style={{ fontSize: '28px', fontWeight: '700', color: '#3B82F6' }}>{students.filter(s => s.student_status === 'active').length}</div><div style={{ fontSize: '13px', color: '#94A3B8' }}>Đang học</div></div>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}><div style={{ fontSize: '28px', fontWeight: '700', color: '#10B981' }}>{formatCurrency(studentStats.totalPaid)}</div><div style={{ fontSize: '13px', color: '#94A3B8' }}>Đã thu</div></div>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}><div style={{ fontSize: '28px', fontWeight: '700', color: '#EF4444' }}>{formatCurrency(studentStats.totalRemaining)}</div><div style={{ fontSize: '13px', color: '#94A3B8' }}>Còn nợ</div></div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="🔍 Tìm kiếm..." value={searchStudent} onChange={e => setSearchStudent(e.target.value)} style={{ padding: '10px 16px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '10px', color: '#F1F5F9', fontSize: '14px', outline: 'none', minWidth: '200px' }} />
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

          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div className="table-row" style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 1fr 100px', background: 'rgba(15, 23, 42, 0.5)', fontWeight: '600', fontSize: '13px', color: '#94A3B8' }}>
              <div>Học viên</div><div>Liên hệ</div><div>Khóa học</div><div>Đã đóng</div><div>Còn lại</div><div>Trạng thái</div><div>Thao tác</div>
            </div>
            {filteredStudents.map(s => (
              <div key={s.id} className="table-row" style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 1fr 100px', cursor: 'pointer' }} onClick={() => setViewStudent(s)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `linear-gradient(135deg, ${COLORS[s.id % COLORS.length]}44, ${COLORS[s.id % COLORS.length]}22)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: COLORS[s.id % COLORS.length] }}>{s.full_name?.charAt(0)}</div>
                  <div><div style={{ fontWeight: '500' }}>{s.full_name}</div><div style={{ fontSize: '12px', color: '#64748B' }}>{s.source}</div></div>
                </div>
                <div><div style={{ fontSize: '13px' }}>{s.phone}</div><div style={{ fontSize: '12px', color: '#64748B' }}>{s.email}</div></div>
                <div style={{ fontSize: '13px' }}>{s.course_name}</div>
                <div style={{ fontWeight: '500', color: '#10B981' }}>{formatCurrency(s.paid_amount)}</div>
                <div style={{ fontWeight: '500', color: s.remaining_amount > 0 ? '#EF4444' : '#10B981' }}>{formatCurrency(s.remaining_amount)}</div>
                <div><span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', background: `${PAYMENT_COLORS[s.payment_status]}22`, color: PAYMENT_COLORS[s.payment_status] }}>{getPaymentStatusLabel(s.payment_status)}</span></div>
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
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>👥 Quản lý Nhân sự ({employees.length})</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select className="filter-select" value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)}>
                <option value="all">Tất cả phòng ban</option>
                <option value="AI Training">AI Training</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
              </select>
              <button onClick={() => openAddModal('employee')} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #0D9488, #0F766E)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', cursor: 'pointer' }}>➕ Thêm</button>
            </div>
          </div>
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div className="table-row" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 100px', background: 'rgba(15, 23, 42, 0.5)', fontWeight: '600', fontSize: '13px', color: '#94A3B8' }}>
              <div>Nhân viên</div><div>Phòng ban</div><div>Workload</div><div>Performance</div><div>Lương</div><div>Thao tác</div>
            </div>
            {filteredEmployees.map(emp => (
              <div key={emp.id} className="table-row" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 100px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `linear-gradient(135deg, ${COLORS[emp.id % COLORS.length]}44, ${COLORS[emp.id % COLORS.length]}22)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: COLORS[emp.id % COLORS.length] }}>{emp.name?.charAt(0)}</div>
                  <div><div style={{ fontWeight: '500' }}>{emp.name}</div><div style={{ fontSize: '13px', color: '#94A3B8' }}>{emp.role}</div></div>
                </div>
                <div>{emp.department}</div>
                <div><div className="progress-bar" style={{ width: '80px' }}><div className="progress-fill" style={{ width: `${emp.workload}%`, background: emp.workload > 80 ? '#EF4444' : '#10B981' }}></div></div></div>
                <div style={{ color: emp.performance >= 90 ? '#10B981' : '#F59E0B', fontWeight: '600' }}>{emp.performance}%</div>
                <div style={{ fontWeight: '500' }}>{((emp.salary || 0) / 1000000).toFixed(0)}M</div>
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
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>📚 Quản lý Khóa học ({courses.length})</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select className="filter-select" value={filterCourseStatus} onChange={e => setFilterCourseStatus(e.target.value)}>
                <option value="all">Tất cả</option>
                <option value="active">Đang diễn ra</option>
                <option value="upcoming">Sắp tới</option>
                <option value="completed">Hoàn thành</option>
              </select>
              <button onClick={() => openAddModal('course')} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #0D9488, #0F766E)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', cursor: 'pointer' }}>➕ Thêm</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            {filteredCourses.map((course, index) => (
              <div key={course.id} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <span className="status-badge" style={{ background: course.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : course.status === 'upcoming' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(148, 163, 184, 0.2)', color: course.status === 'active' ? '#10B981' : course.status === 'upcoming' ? '#3B82F6' : '#94A3B8' }}>{course.status === 'active' ? 'Đang diễn ra' : course.status === 'upcoming' ? 'Sắp tới' : 'Hoàn thành'}</span>
                    <h4 style={{ margin: '8px 0 4px 0', fontSize: '16px' }}>{course.name}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>👤 {course.instructor}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="action-btn edit" onClick={() => openEditModal('course', course)}>✏️</button>
                    <button className="action-btn delete" onClick={() => handleDelete('course', course.id)}>🗑️</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><div style={{ fontSize: '12px', color: '#94A3B8' }}>Học viên</div><div style={{ fontSize: '18px', fontWeight: '600' }}>{course.students}</div></div>
                  <div><div style={{ fontSize: '12px', color: '#94A3B8' }}>Doanh thu</div><div style={{ fontSize: '18px', fontWeight: '600', color: '#10B981' }}>{formatCurrency(course.revenue)}</div></div>
                </div>
                <div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ fontSize: '13px', color: '#94A3B8' }}>Tiến độ</span><span style={{ fontSize: '13px', fontWeight: '500' }}>{course.progress}%</span></div><div className="progress-bar"><div className="progress-fill" style={{ width: `${course.progress}%`, background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})` }}></div></div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FINANCE TAB */}
      {activeTab === 'finance' && (
        <div>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>💰 Tài chính</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="kpi-card" style={{ '--accent-color': '#10B981' }}><p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 8px 0' }}>ĐÃ THU</p><h2 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#10B981' }}>{formatCurrency(studentStats.totalPaid)}</h2></div>
            <div className="kpi-card" style={{ '--accent-color': '#EF4444' }}><p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 8px 0' }}>CÒN NỢ</p><h2 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#EF4444' }}>{formatCurrency(studentStats.totalRemaining)}</h2></div>
            <div className="kpi-card" style={{ '--accent-color': '#3B82F6' }}><p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 8px 0' }}>DOANH THU</p><h2 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#3B82F6' }}>{totalRevenue}M</h2></div>
            <div className="kpi-card" style={{ '--accent-color': '#8B5CF6' }}><p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 8px 0' }}>TỶ LỆ THU</p><h2 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#8B5CF6' }}>{studentStats.totalTuition > 0 ? Math.round(studentStats.totalPaid / studentStats.totalTuition * 100) : 0}%</h2></div>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px' }}>Doanh thu vs Chi phí</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData.actual}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="revenue" fill="#10B981" name="Doanh thu" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#EF4444" name="Chi phí" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SALES TAB */}
      {activeTab === 'sales' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>🎯 Sales Pipeline ({leads.length} leads)</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select className="filter-select" value={filterStage} onChange={e => setFilterStage(e.target.value)}>
                <option value="all">Tất cả</option>
                <option value="discovery">Khám phá</option>
                <option value="qualification">Đánh giá</option>
                <option value="proposal">Đề xuất</option>
                <option value="negotiation">Đàm phán</option>
                <option value="closed-won">Thành công</option>
              </select>
              <button onClick={() => openAddModal('lead')} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #0D9488, #0F766E)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', cursor: 'pointer' }}>➕ Thêm</button>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px' }}>Pipeline Funnel</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '600px', margin: '0 auto' }}>
              {pipelineStages.map((stage, index) => {
                const width = 100 - (index * 15);
                return (<div key={stage.key} style={{ width: `${width}%`, margin: '0 auto', padding: '12px 20px', background: `linear-gradient(90deg, ${COLORS[index]}dd, ${COLORS[index]}88)`, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', color: 'white', fontWeight: '500' }}><span>{stage.name}</span><span>{stage.deals} deals • {stage.amount}M</span></div>);
              })}
            </div>
          </div>

          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div className="table-row" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 100px', background: 'rgba(15, 23, 42, 0.5)', fontWeight: '600', fontSize: '13px', color: '#94A3B8' }}>
              <div>Công ty</div><div>Liên hệ</div><div>Giá trị</div><div>Giai đoạn</div><div>Xác suất</div><div>Thao tác</div>
            </div>
            {filteredLeads.map(lead => (
              <div key={lead.id} className="table-row" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 100px' }}>
                <div style={{ fontWeight: '500' }}>{lead.company}</div>
                <div><div>{lead.contact}</div><div style={{ fontSize: '12px', color: '#64748B' }}>{lead.email}</div></div>
                <div style={{ fontWeight: '600', color: '#10B981' }}>{formatCurrency(lead.value)}</div>
                <div><span className="status-badge" style={{ background: `${STAGE_COLORS[lead.stage]}22`, color: STAGE_COLORS[lead.stage] }}>{getStageLabel(lead.stage)}</span></div>
                <div>{lead.probability}%</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="action-btn edit" onClick={() => openEditModal('lead', lead)}>✏️</button>
                  <button className="action-btn delete" onClick={() => handleDelete('lead', lead.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '40px', padding: '20px', textAlign: 'center', borderTop: '1px solid rgba(148, 163, 184, 0.1)', color: '#64748B', fontSize: '13px' }}>
        © 2025 AI Workforce Solutions • Dashboard v3.0 with Supabase
      </div>

      {/* Modals */}
      <Modal isOpen={modalType === 'employee'} onClose={closeModal} title={editingItem ? 'Sửa nhân viên' : 'Thêm nhân viên'}>
        {renderEmployeeForm()}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button onClick={closeModal} style={{ padding: '10px 20px', background: 'rgba(148, 163, 184, 0.2)', border: 'none', borderRadius: '8px', color: '#F1F5F9', cursor: 'pointer' }}>Hủy</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0D9488, #0F766E)', border: 'none', borderRadius: '8px', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? '⏳ Đang lưu...' : '💾 Lưu'}</button>
        </div>
      </Modal>

      <Modal isOpen={modalType === 'course'} onClose={closeModal} title={editingItem ? 'Sửa khóa học' : 'Thêm khóa học'}>
        {renderCourseForm()}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button onClick={closeModal} style={{ padding: '10px 20px', background: 'rgba(148, 163, 184, 0.2)', border: 'none', borderRadius: '8px', color: '#F1F5F9', cursor: 'pointer' }}>Hủy</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0D9488, #0F766E)', border: 'none', borderRadius: '8px', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? '⏳ Đang lưu...' : '💾 Lưu'}</button>
        </div>
      </Modal>

      <Modal isOpen={modalType === 'lead'} onClose={closeModal} title={editingItem ? 'Sửa Lead' : 'Thêm Lead'}>
        {renderLeadForm()}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button onClick={closeModal} style={{ padding: '10px 20px', background: 'rgba(148, 163, 184, 0.2)', border: 'none', borderRadius: '8px', color: '#F1F5F9', cursor: 'pointer' }}>Hủy</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0D9488, #0F766E)', border: 'none', borderRadius: '8px', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? '⏳ Đang lưu...' : '💾 Lưu'}</button>
        </div>
      </Modal>

      <Modal isOpen={modalType === 'student'} onClose={closeModal} title={editingItem ? 'Sửa học viên' : 'Thêm học viên'} wide>
        {renderStudentForm()}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button onClick={closeModal} style={{ padding: '10px 20px', background: 'rgba(148, 163, 184, 0.2)', border: 'none', borderRadius: '8px', color: '#F1F5F9', cursor: 'pointer' }}>Hủy</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0D9488, #0F766E)', border: 'none', borderRadius: '8px', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? '⏳ Đang lưu...' : '💾 Lưu'}</button>
        </div>
      </Modal>

      {/* Student Detail Modal */}
      {viewStudent && (
        <Modal isOpen={true} onClose={() => setViewStudent(null)} title="Chi tiết Học viên" wide>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'rgba(13, 148, 136, 0.1)', borderRadius: '12px', marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'linear-gradient(135deg, #0D9488, #0F766E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', color: 'white' }}>{viewStudent.full_name?.charAt(0)}</div>
            <div><h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{viewStudent.full_name}</h3><p style={{ margin: 0, color: '#94A3B8', fontSize: '14px' }}>{viewStudent.course_name}</p></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '20px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94A3B8' }}>THÔNG TIN CÁ NHÂN</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: '#94A3B8' }}>SĐT</span><span>{viewStudent.phone}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: '#94A3B8' }}>Email</span><span>{viewStudent.email}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: '#94A3B8' }}>Nguồn</span><span>{viewStudent.source}</span></div>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '20px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94A3B8' }}>THÔNG TIN HỌC PHÍ</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: '#94A3B8' }}>Học phí</span><span>{formatCurrency(viewStudent.tuition_fee)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: '#94A3B8' }}>Giảm giá</span><span style={{ color: '#F59E0B' }}>{formatCurrency(viewStudent.discount_amount)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: '#94A3B8' }}>Đã đóng</span><span style={{ color: '#10B981' }}>{formatCurrency(viewStudent.paid_amount)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: '#94A3B8' }}>Còn lại</span><span style={{ color: viewStudent.remaining_amount > 0 ? '#EF4444' : '#10B981' }}>{formatCurrency(viewStudent.remaining_amount)}</span></div>
            </div>
          </div>
          {viewStudent.notes && <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '20px', marginTop: '24px' }}><h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#94A3B8' }}>GHI CHÚ</h4><p style={{ margin: 0, lineHeight: '1.6' }}>{viewStudent.notes}</p></div>}
        </Modal>
      )}
    </div>
  );
}
