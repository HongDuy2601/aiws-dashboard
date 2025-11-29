import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as XLSX from 'xlsx';

// ============================================
// DATA - Sau này sẽ thay bằng fetch từ database
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
  { id: 1, name: 'AI Fundamentals cho Doanh nghiệp', instructor: 'Nguyễn Văn An', students: 45, progress: 75, status: 'active', revenue: 135000000, startDate: '2025-01-15', endDate: '2025-03-15', category: 'AI Training' },
  { id: 2, name: 'Digital Marketing Masterclass', instructor: 'Trần Thị Bình', students: 38, progress: 60, status: 'active', revenue: 95000000, startDate: '2025-02-01', endDate: '2025-04-01', category: 'Digital Marketing' },
  { id: 3, name: 'E-commerce Strategy', instructor: 'Phạm Minh Dũng', students: 52, progress: 90, status: 'active', revenue: 156000000, startDate: '2024-12-01', endDate: '2025-02-28', category: 'E-commerce' },
  { id: 4, name: 'ChatGPT for Business', instructor: 'Nguyễn Văn An', students: 60, progress: 40, status: 'active', revenue: 180000000, startDate: '2025-02-15', endDate: '2025-05-15', category: 'AI Training' },
  { id: 5, name: 'SEO Advanced', instructor: 'Trần Thị Bình', students: 25, progress: 100, status: 'completed', revenue: 62500000, startDate: '2024-10-01', endDate: '2024-12-31', category: 'Digital Marketing' },
  { id: 6, name: 'AI Automation Workshop', instructor: 'Hoàng Văn Phúc', students: 30, progress: 20, status: 'upcoming', revenue: 90000000, startDate: '2025-03-01', endDate: '2025-04-30', category: 'AI Training' },
];

const initialLeads = [
  { id: 1, company: 'Công ty Dược phẩm ABC', contact: 'Nguyễn Văn X', email: 'nguyenx@abc.com', phone: '0901234567', value: 500000000, stage: 'negotiation', probability: 75, source: 'Referral', createdAt: '2025-01-10', notes: 'Quan tâm đào tạo AI cho sales team' },
  { id: 2, company: 'Tập đoàn Thủy sản XYZ', contact: 'Trần Thị Y', email: 'trany@xyz.com', phone: '0912345678', value: 350000000, stage: 'proposal', probability: 60, source: 'Website', createdAt: '2025-01-15', notes: 'Cần chatbot cho CSKH' },
  { id: 3, company: 'Ngân hàng VN Bank', contact: 'Lê Văn Z', email: 'lez@vnbank.com', phone: '0923456789', value: 800000000, stage: 'qualification', probability: 40, source: 'Event', createdAt: '2025-01-20', notes: 'Gặp tại Tech Summit 2025' },
  { id: 4, company: 'FPT Software', contact: 'Phạm Văn W', email: 'phamw@fpt.com', phone: '0934567890', value: 450000000, stage: 'closed-won', probability: 100, source: 'LinkedIn', createdAt: '2024-12-01', notes: 'Đã ký hợp đồng' },
  { id: 5, company: 'Vingroup Education', contact: 'Hoàng Thị V', email: 'hoangv@vingroup.com', phone: '0945678901', value: 650000000, stage: 'negotiation', probability: 70, source: 'Referral', createdAt: '2025-01-25', notes: 'Đang thương thảo giá' },
  { id: 6, company: 'Techcombank', contact: 'Võ Văn U', email: 'vou@techcombank.com', phone: '0956789012', value: 300000000, stage: 'discovery', probability: 25, source: 'Cold Call', createdAt: '2025-02-01', notes: 'Mới liên hệ lần đầu' },
];

const financialData = [
  { month: 'T8/24', revenue: 450, expenses: 320, profit: 130, courses: 4 },
  { month: 'T9/24', revenue: 520, expenses: 350, profit: 170, courses: 5 },
  { month: 'T10/24', revenue: 480, expenses: 330, profit: 150, courses: 4 },
  { month: 'T11/24', revenue: 620, expenses: 400, profit: 220, courses: 6 },
  { month: 'T12/24', revenue: 750, expenses: 450, profit: 300, courses: 7 },
  { month: 'T1/25', revenue: 680, expenses: 420, profit: 260, courses: 6 },
  { month: 'T2/25', revenue: 720, expenses: 440, profit: 280, courses: 7 },
];

const forecastData = [
  { month: 'T3/25', revenue: 780, expenses: 460, profit: 320, type: 'forecast' },
  { month: 'T4/25', revenue: 850, expenses: 490, profit: 360, type: 'forecast' },
  { month: 'T5/25', revenue: 920, expenses: 520, profit: 400, type: 'forecast' },
  { month: 'T6/25', revenue: 980, expenses: 550, profit: 430, type: 'forecast' },
];

const pipelineStages = [
  { name: 'Discovery', value: 1, deals: 1, amount: 300 },
  { name: 'Qualification', value: 2, deals: 1, amount: 800 },
  { name: 'Proposal', value: 3, deals: 1, amount: 350 },
  { name: 'Negotiation', value: 4, deals: 2, amount: 1150 },
  { name: 'Closed Won', value: 5, deals: 1, amount: 450 },
];

// ============================================
// MODAL COMPONENT
// ============================================
const Modal = ({ isOpen, onClose, title, children }) => {
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
        maxWidth: '600px',
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
const FormInput = ({ label, type = 'text', value, onChange, options, required, placeholder }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94A3B8' }}>
      {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
    </label>
    {type === 'select' ? (
      <select
        value={value}
        onChange={onChange}
        required={required}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: 'rgba(30, 41, 59, 0.8)',
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
        style={{
          width: '100%',
          padding: '10px 12px',
          background: 'rgba(30, 41, 59, 0.8)',
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
// MAIN DASHBOARD COMPONENT
// ============================================
export default function AIWSDashboard() {
  // State for data
  const [employees, setEmployees] = useState(initialEmployees);
  const [courses, setCourses] = useState(initialCourses);
  const [leads, setLeads] = useState(initialLeads);
  
  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [filterCourseStatus, setFilterCourseStatus] = useState('all');
  
  // Modal State
  const [modalType, setModalType] = useState(null); // 'employee', 'course', 'lead'
  const [editingItem, setEditingItem] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({});

  const COLORS = ['#0D9488', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981'];
  const STAGE_COLORS = {
    'discovery': '#94A3B8',
    'qualification': '#60A5FA',
    'proposal': '#F59E0B',
    'negotiation': '#8B5CF6',
    'closed-won': '#10B981',
    'closed-lost': '#EF4444'
  };

  // ============================================
  // EXPORT FUNCTIONS
  // ============================================
  const exportToExcel = (type) => {
    let data, fileName;
    
    switch(type) {
      case 'employees':
        data = employees.map(e => ({
          'Họ tên': e.name,
          'Chức vụ': e.role,
          'Phòng ban': e.department,
          'Trạng thái': e.status === 'active' ? 'Đang làm' : 'Nghỉ phép',
          'Workload (%)': e.workload,
          'Số khóa dạy': e.courses,
          'Performance (%)': e.performance,
          'Lương (VNĐ)': e.salary
        }));
        fileName = 'AIWS_NhanSu';
        break;
      case 'courses':
        data = courses.map(c => ({
          'Tên khóa học': c.name,
          'Giảng viên': c.instructor,
          'Số học viên': c.students,
          'Tiến độ (%)': c.progress,
          'Trạng thái': c.status === 'active' ? 'Đang diễn ra' : c.status === 'upcoming' ? 'Sắp tới' : 'Hoàn thành',
          'Doanh thu (VNĐ)': c.revenue,
          'Ngày bắt đầu': c.startDate,
          'Ngày kết thúc': c.endDate,
          'Danh mục': c.category
        }));
        fileName = 'AIWS_KhoaHoc';
        break;
      case 'leads':
        data = leads.map(l => ({
          'Công ty': l.company,
          'Người liên hệ': l.contact,
          'Email': l.email,
          'Điện thoại': l.phone,
          'Giá trị (VNĐ)': l.value,
          'Giai đoạn': getStageLabel(l.stage),
          'Xác suất (%)': l.probability,
          'Nguồn': l.source,
          'Ngày tạo': l.createdAt,
          'Ghi chú': l.notes
        }));
        fileName = 'AIWS_Leads';
        break;
      case 'finance':
        data = [...financialData, ...forecastData].map(f => ({
          'Tháng': f.month,
          'Doanh thu (Triệu)': f.revenue,
          'Chi phí (Triệu)': f.expenses,
          'Lợi nhuận (Triệu)': f.profit,
          'Loại': f.type === 'forecast' ? 'Dự báo' : 'Thực tế'
        }));
        fileName = 'AIWS_TaiChinh';
        break;
      case 'all':
        // Create workbook with multiple sheets
        const wb = XLSX.utils.book_new();
        
        const empSheet = XLSX.utils.json_to_sheet(employees.map(e => ({
          'Họ tên': e.name, 'Chức vụ': e.role, 'Phòng ban': e.department,
          'Trạng thái': e.status === 'active' ? 'Đang làm' : 'Nghỉ phép',
          'Workload (%)': e.workload, 'Performance (%)': e.performance, 'Lương (VNĐ)': e.salary
        })));
        XLSX.utils.book_append_sheet(wb, empSheet, 'Nhân sự');
        
        const courseSheet = XLSX.utils.json_to_sheet(courses.map(c => ({
          'Tên khóa học': c.name, 'Giảng viên': c.instructor, 'Số học viên': c.students,
          'Tiến độ (%)': c.progress, 'Doanh thu (VNĐ)': c.revenue, 'Danh mục': c.category
        })));
        XLSX.utils.book_append_sheet(wb, courseSheet, 'Khóa học');
        
        const leadsSheet = XLSX.utils.json_to_sheet(leads.map(l => ({
          'Công ty': l.company, 'Người liên hệ': l.contact, 'Email': l.email,
          'Giá trị (VNĐ)': l.value, 'Giai đoạn': getStageLabel(l.stage), 'Xác suất (%)': l.probability
        })));
        XLSX.utils.book_append_sheet(wb, leadsSheet, 'Leads');
        
        const financeSheet = XLSX.utils.json_to_sheet([...financialData, ...forecastData].map(f => ({
          'Tháng': f.month, 'Doanh thu': f.revenue, 'Chi phí': f.expenses, 'Lợi nhuận': f.profit
        })));
        XLSX.utils.book_append_sheet(wb, financeSheet, 'Tài chính');
        
        XLSX.writeFile(wb, `AIWS_BaoCaoTongHop_${new Date().toISOString().split('T')[0]}.xlsx`);
        setShowExportMenu(false);
        return;
      default:
        return;
    }
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    setShowExportMenu(false);
  };

  // ============================================
  // CRUD FUNCTIONS
  // ============================================
  const openAddModal = (type) => {
    setModalType(type);
    setEditingItem(null);
    setFormData({});
  };

  const openEditModal = (type, item) => {
    setModalType(type);
    setEditingItem(item);
    setFormData(item);
  };

  const closeModal = () => {
    setModalType(null);
    setEditingItem(null);
    setFormData({});
  };

  const handleSave = () => {
    if (modalType === 'employee') {
      if (editingItem) {
        setEmployees(employees.map(e => e.id === editingItem.id ? { ...formData, id: editingItem.id } : e));
      } else {
        setEmployees([...employees, { ...formData, id: Date.now() }]);
      }
    } else if (modalType === 'course') {
      if (editingItem) {
        setCourses(courses.map(c => c.id === editingItem.id ? { ...formData, id: editingItem.id } : c));
      } else {
        setCourses([...courses, { ...formData, id: Date.now() }]);
      }
    } else if (modalType === 'lead') {
      if (editingItem) {
        setLeads(leads.map(l => l.id === editingItem.id ? { ...formData, id: editingItem.id } : l));
      } else {
        setLeads([...leads, { ...formData, id: Date.now(), createdAt: new Date().toISOString().split('T')[0] }]);
      }
    }
    closeModal();
  };

  const handleDelete = (type, id) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    
    if (type === 'employee') {
      setEmployees(employees.filter(e => e.id !== id));
    } else if (type === 'course') {
      setCourses(courses.filter(c => c.id !== id));
    } else if (type === 'lead') {
      setLeads(leads.filter(l => l.id !== id));
    }
  };

  // ============================================
  // CALCULATIONS
  // ============================================
  const totalRevenue = financialData.reduce((sum, d) => sum + d.revenue, 0);
  const totalStudents = courses.reduce((sum, c) => sum + c.students, 0);
  const avgCourseProgress = Math.round(courses.filter(c => c.status === 'active').reduce((sum, c) => sum + c.progress, 0) / courses.filter(c => c.status === 'active').length) || 0;
  const pipelineValue = leads.filter(l => l.stage !== 'closed-won' && l.stage !== 'closed-lost').reduce((sum, l) => sum + l.value, 0);
  const weightedPipeline = leads.filter(l => l.stage !== 'closed-won' && l.stage !== 'closed-lost').reduce((sum, l) => sum + (l.value * l.probability / 100), 0);

  const filteredEmployees = useMemo(() => {
    return filterDepartment === 'all' 
      ? employees 
      : employees.filter(e => e.department === filterDepartment);
  }, [filterDepartment, employees]);

  const filteredLeads = useMemo(() => {
    return filterStage === 'all'
      ? leads
      : leads.filter(l => l.stage === filterStage);
  }, [filterStage, leads]);

  const filteredCourses = useMemo(() => {
    return filterCourseStatus === 'all'
      ? courses
      : courses.filter(c => c.status === filterCourseStatus);
  }, [filterCourseStatus, courses]);

  const departmentDistribution = useMemo(() => {
    const dept = {};
    employees.forEach(e => {
      dept[e.department] = (dept[e.department] || 0) + 1;
    });
    return Object.entries(dept).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const coursesByCategory = useMemo(() => {
    const cat = {};
    courses.forEach(c => {
      cat[c.category] = (cat[c.category] || 0) + c.revenue;
    });
    return Object.entries(cat).map(([name, value]) => ({ name, value: value / 1000000 }));
  }, [courses]);

  const formatCurrency = (value) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    return value.toLocaleString('vi-VN');
  };

  const getStageLabel = (stage) => {
    const labels = {
      'discovery': 'Khám phá',
      'qualification': 'Đánh giá',
      'proposal': 'Đề xuất',
      'negotiation': 'Đàm phán',
      'closed-won': 'Thành công',
      'closed-lost': 'Thất bại'
    };
    return labels[stage] || stage;
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: '📊' },
    { id: 'employees', label: 'Nhân sự', icon: '👥' },
    { id: 'courses', label: 'Khóa học', icon: '📚' },
    { id: 'finance', label: 'Tài chính', icon: '💰' },
    { id: 'sales', label: 'Sales Pipeline', icon: '🎯' },
  ];

  // ============================================
  // RENDER FORMS
  // ============================================
  const renderEmployeeForm = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput label="Họ tên" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
        <FormInput label="Chức vụ" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} required />
      </div>
      <FormInput 
        label="Phòng ban" 
        type="select" 
        value={formData.department || ''} 
        onChange={e => setFormData({...formData, department: e.target.value})}
        options={[
          { value: 'AI Training', label: 'AI Training' },
          { value: 'Digital Marketing', label: 'Digital Marketing' },
          { value: 'E-commerce', label: 'E-commerce' },
          { value: 'Sales', label: 'Sales' },
          { value: 'Operations', label: 'Operations' },
        ]}
        required
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput 
          label="Trạng thái" 
          type="select" 
          value={formData.status || 'active'} 
          onChange={e => setFormData({...formData, status: e.target.value})}
          options={[
            { value: 'active', label: 'Đang làm' },
            { value: 'on-leave', label: 'Nghỉ phép' },
          ]}
        />
        <FormInput label="Lương (VNĐ)" type="number" value={formData.salary || ''} onChange={e => setFormData({...formData, salary: parseInt(e.target.value) || 0})} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <FormInput label="Workload (%)" type="number" value={formData.workload || ''} onChange={e => setFormData({...formData, workload: parseInt(e.target.value) || 0})} />
        <FormInput label="Số khóa dạy" type="number" value={formData.courses || ''} onChange={e => setFormData({...formData, courses: parseInt(e.target.value) || 0})} />
        <FormInput label="Performance (%)" type="number" value={formData.performance || ''} onChange={e => setFormData({...formData, performance: parseInt(e.target.value) || 0})} />
      </div>
    </>
  );

  const renderCourseForm = () => (
    <>
      <FormInput label="Tên khóa học" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput label="Giảng viên" value={formData.instructor || ''} onChange={e => setFormData({...formData, instructor: e.target.value})} required />
        <FormInput 
          label="Danh mục" 
          type="select" 
          value={formData.category || ''} 
          onChange={e => setFormData({...formData, category: e.target.value})}
          options={[
            { value: 'AI Training', label: 'AI Training' },
            { value: 'Digital Marketing', label: 'Digital Marketing' },
            { value: 'E-commerce', label: 'E-commerce' },
          ]}
          required
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput label="Ngày bắt đầu" type="date" value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
        <FormInput label="Ngày kết thúc" type="date" value={formData.endDate || ''} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <FormInput label="Số học viên" type="number" value={formData.students || ''} onChange={e => setFormData({...formData, students: parseInt(e.target.value) || 0})} />
        <FormInput label="Tiến độ (%)" type="number" value={formData.progress || ''} onChange={e => setFormData({...formData, progress: parseInt(e.target.value) || 0})} />
        <FormInput label="Doanh thu (VNĐ)" type="number" value={formData.revenue || ''} onChange={e => setFormData({...formData, revenue: parseInt(e.target.value) || 0})} />
      </div>
      <FormInput 
        label="Trạng thái" 
        type="select" 
        value={formData.status || 'upcoming'} 
        onChange={e => setFormData({...formData, status: e.target.value})}
        options={[
          { value: 'upcoming', label: 'Sắp tới' },
          { value: 'active', label: 'Đang diễn ra' },
          { value: 'completed', label: 'Hoàn thành' },
        ]}
      />
    </>
  );

  const renderLeadForm = () => (
    <>
      <FormInput label="Tên công ty" value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} required />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput label="Người liên hệ" value={formData.contact || ''} onChange={e => setFormData({...formData, contact: e.target.value})} required />
        <FormInput label="Email" type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput label="Điện thoại" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
        <FormInput label="Giá trị deal (VNĐ)" type="number" value={formData.value || ''} onChange={e => setFormData({...formData, value: parseInt(e.target.value) || 0})} required />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput 
          label="Giai đoạn" 
          type="select" 
          value={formData.stage || 'discovery'} 
          onChange={e => setFormData({...formData, stage: e.target.value})}
          options={[
            { value: 'discovery', label: 'Khám phá' },
            { value: 'qualification', label: 'Đánh giá' },
            { value: 'proposal', label: 'Đề xuất' },
            { value: 'negotiation', label: 'Đàm phán' },
            { value: 'closed-won', label: 'Thành công' },
            { value: 'closed-lost', label: 'Thất bại' },
          ]}
          required
        />
        <FormInput label="Xác suất (%)" type="number" value={formData.probability || ''} onChange={e => setFormData({...formData, probability: parseInt(e.target.value) || 0})} />
      </div>
      <FormInput 
        label="Nguồn" 
        type="select" 
        value={formData.source || ''} 
        onChange={e => setFormData({...formData, source: e.target.value})}
        options={[
          { value: 'Website', label: 'Website' },
          { value: 'Referral', label: 'Giới thiệu' },
          { value: 'LinkedIn', label: 'LinkedIn' },
          { value: 'Event', label: 'Sự kiện' },
          { value: 'Cold Call', label: 'Cold Call' },
          { value: 'Facebook', label: 'Facebook' },
        ]}
      />
      <FormInput label="Ghi chú" type="textarea" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Thông tin thêm về lead..." />
    </>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      fontFamily: '"DM Sans", system-ui, sans-serif',
      color: '#F1F5F9',
      padding: '24px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        
        * { box-sizing: border-box; }
        
        .glass-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          transition: all 0.3s ease;
        }
        
        .glass-card:hover {
          border-color: rgba(148, 163, 184, 0.2);
          transform: translateY(-2px);
        }
        
        .kpi-card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        
        .kpi-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--accent-color), transparent);
        }
        
        .tab-btn {
          padding: 12px 20px;
          border: none;
          background: transparent;
          color: #94A3B8;
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 10px;
          transition: all 0.2s ease;
        }
        
        .tab-btn:hover {
          background: rgba(148, 163, 184, 0.1);
          color: #F1F5F9;
        }
        
        .tab-btn.active {
          background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
          color: white;
        }
        
        .progress-bar {
          height: 8px;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        .table-row {
          display: grid;
          padding: 16px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          align-items: center;
          transition: background 0.2s ease;
        }
        
        .table-row:hover {
          background: rgba(148, 163, 184, 0.05);
        }
        
        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .filter-select {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #F1F5F9;
          padding: 10px 16px;
          border-radius: 10px;
          font-family: inherit;
          font-size: 14px;
          cursor: pointer;
          outline: none;
        }
        
        .filter-select:focus {
          border-color: #0D9488;
        }
        
        .action-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        
        .action-btn:hover {
          transform: scale(1.05);
        }
        
        .action-btn.edit {
          background: rgba(59, 130, 246, 0.2);
          color: #60A5FA;
        }
        
        .action-btn.delete {
          background: rgba(239, 68, 68, 0.2);
          color: #EF4444;
        }
        
        .gantt-bar {
          height: 28px;
          border-radius: 6px;
          position: relative;
          display: flex;
          align-items: center;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 500;
          color: white;
          overflow: hidden;
        }
        
        .metric-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
        }
        
        .metric-trend.up { color: #10B981; }
        .metric-trend.down { color: #EF4444; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-in {
          animation: fadeIn 0.4s ease forwards;
        }
        
        .pipeline-stage {
          padding: 16px;
          border-radius: 12px;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .pipeline-stage:hover {
          transform: scale(1.02);
        }
        
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: #1E293B;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          padding: 8px;
          min-width: 200px;
          z-index: 100;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        
        .dropdown-item {
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          transition: background 0.2s;
        }
        
        .dropdown-item:hover {
          background: rgba(148, 163, 184, 0.1);
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🤖
            </div>
            <h1 style={{
              fontSize: '28px',
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              AI Workforce Solutions
            </h1>
          </div>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '14px' }}>
            Dashboard Quản lý Tổng hợp • Cập nhật: {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Export Button with Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              style={{
                padding: '10px 20px',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '10px',
                color: '#F1F5F9',
                fontFamily: 'inherit',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📥 Xuất báo cáo ▾
            </button>
            {showExportMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={() => exportToExcel('all')}>
                  📊 Xuất tất cả (Excel)
                </div>
                <div className="dropdown-item" onClick={() => exportToExcel('employees')}>
                  👥 Xuất Nhân sự
                </div>
                <div className="dropdown-item" onClick={() => exportToExcel('courses')}>
                  📚 Xuất Khóa học
                </div>
                <div className="dropdown-item" onClick={() => exportToExcel('leads')}>
                  🎯 Xuất Leads
                </div>
                <div className="dropdown-item" onClick={() => exportToExcel('finance')}>
                  💰 Xuất Tài chính
                </div>
              </div>
            )}
          </div>
          
          {/* Add New Button */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => {
                if (activeTab === 'employees') openAddModal('employee');
                else if (activeTab === 'courses') openAddModal('course');
                else if (activeTab === 'sales') openAddModal('lead');
                else openAddModal('lead'); // default
              }}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontFamily: 'inherit',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ➕ Thêm mới
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        background: 'rgba(30, 41, 59, 0.5)',
        padding: '8px',
        borderRadius: '14px',
        width: 'fit-content'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="animate-in">
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="kpi-card" style={{ '--accent-color': '#0D9488' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Tổng doanh thu</p>
                  <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0, fontFamily: '"Space Grotesk", sans-serif' }}>
                    {totalRevenue}M
                  </h2>
                  <div className="metric-trend up" style={{ marginTop: '8px' }}>
                    <span>↑</span> 15.2% vs tháng trước
                  </div>
                </div>
                <div style={{ fontSize: '36px', opacity: 0.3 }}>💰</div>
              </div>
            </div>

            <div className="kpi-card" style={{ '--accent-color': '#3B82F6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Học viên</p>
                  <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0, fontFamily: '"Space Grotesk", sans-serif' }}>
                    {totalStudents}
                  </h2>
                  <div className="metric-trend up" style={{ marginTop: '8px' }}>
                    <span>↑</span> 23 học viên mới
                  </div>
                </div>
                <div style={{ fontSize: '36px', opacity: 0.3 }}>👨‍🎓</div>
              </div>
            </div>

            <div className="kpi-card" style={{ '--accent-color': '#F59E0B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Pipeline Value</p>
                  <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0, fontFamily: '"Space Grotesk", sans-serif' }}>
                    {formatCurrency(pipelineValue)}
                  </h2>
                  <div style={{ color: '#94A3B8', fontSize: '13px', marginTop: '8px' }}>
                    Weighted: {formatCurrency(weightedPipeline)}
                  </div>
                </div>
                <div style={{ fontSize: '36px', opacity: 0.3 }}>🎯</div>
              </div>
            </div>

            <div className="kpi-card" style={{ '--accent-color': '#8B5CF6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Tiến độ TB</p>
                  <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0, fontFamily: '"Space Grotesk", sans-serif' }}>
                    {avgCourseProgress}%
                  </h2>
                  <div className="progress-bar" style={{ width: '120px', marginTop: '12px' }}>
                    <div className="progress-fill" style={{ width: `${avgCourseProgress}%`, background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)' }}></div>
                  </div>
                </div>
                <div style={{ fontSize: '36px', opacity: 0.3 }}>📈</div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* Revenue Chart */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#0D9488' }}>●</span> Doanh thu & Dự báo (Triệu VNĐ)
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={[...financialData, ...forecastData]}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px' }}
                    labelStyle={{ color: '#F1F5F9' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#0D9488" strokeWidth={2} fill="url(#revenueGradient)" name="Doanh thu" />
                  <Area type="monotone" dataKey="profit" stroke="#F59E0B" strokeWidth={2} fill="url(#profitGradient)" name="Lợi nhuận" strokeDasharray="5 5" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Department Distribution */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#3B82F6' }}>●</span> Phân bổ nhân sự theo phòng ban
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={departmentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {departmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {departmentDistribution.map((item, index) => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: COLORS[index % COLORS.length] }}></div>
                      <span style={{ flex: 1, fontSize: '14px' }}>{item.name}</span>
                      <span style={{ fontWeight: '600' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline Overview */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#8B5CF6' }}>●</span> Sales Pipeline Overview
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              {pipelineStages.map((stage, index) => (
                <div 
                  key={stage.name}
                  className="pipeline-stage"
                  style={{ 
                    background: `linear-gradient(135deg, ${COLORS[index]}22, ${COLORS[index]}11)`,
                    border: `1px solid ${COLORS[index]}44`
                  }}
                >
                  <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS[index], fontFamily: '"Space Grotesk", sans-serif' }}>
                    {stage.deals}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>{stage.name}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{stage.amount}M</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <div className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Quản lý Nhân sự & Giảng viên</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select 
                className="filter-select"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="all">Tất cả phòng ban</option>
                <option value="AI Training">AI Training</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
              </select>
              <button 
                onClick={() => openAddModal('employee')}
                style={{
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                ➕ Thêm nhân viên
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ overflow: 'hidden' }}>
            {/* Table Header */}
            <div className="table-row" style={{ 
              gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 120px',
              background: 'rgba(15, 23, 42, 0.5)',
              fontWeight: '600',
              fontSize: '13px',
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <div>Nhân viên</div>
              <div>Phòng ban</div>
              <div>Trạng thái</div>
              <div>Workload</div>
              <div>Performance</div>
              <div>Lương</div>
              <div>Thao tác</div>
            </div>
            
            {filteredEmployees.map(emp => (
              <div 
                key={emp.id} 
                className="table-row"
                style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 120px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, ${COLORS[emp.id % COLORS.length]}44, ${COLORS[emp.id % COLORS.length]}22)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    color: COLORS[emp.id % COLORS.length]
                  }}>
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '500' }}>{emp.name}</div>
                    <div style={{ fontSize: '13px', color: '#94A3B8' }}>{emp.role}</div>
                  </div>
                </div>
                <div>{emp.department}</div>
                <div>
                  <span 
                    className="status-badge"
                    style={{ 
                      background: emp.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: emp.status === 'active' ? '#10B981' : '#F59E0B'
                    }}
                  >
                    {emp.status === 'active' ? 'Đang làm' : 'Nghỉ phép'}
                  </span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${emp.workload}%`,
                          background: emp.workload > 80 ? '#EF4444' : emp.workload > 60 ? '#F59E0B' : '#10B981'
                        }}
                      ></div>
                    </div>
                    <span style={{ fontSize: '13px', width: '35px' }}>{emp.workload}%</span>
                  </div>
                </div>
                <div>
                  <span style={{ 
                    color: emp.performance >= 90 ? '#10B981' : emp.performance >= 80 ? '#F59E0B' : '#EF4444',
                    fontWeight: '600'
                  }}>
                    {emp.performance}%
                  </span>
                </div>
                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: '500' }}>
                  {(emp.salary / 1000000).toFixed(0)}M
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="action-btn edit" onClick={() => openEditModal('employee', emp)}>✏️ Sửa</button>
                  <button className="action-btn delete" onClick={() => handleDelete('employee', emp.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>

          {/* Workload Distribution Chart */}
          <div className="glass-card" style={{ padding: '24px', marginTop: '20px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Phân bổ Workload</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={employees} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis type="number" stroke="#64748B" fontSize={12} domain={[0, 100]} />
                <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={12} width={120} />
                <Tooltip 
                  contentStyle={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px' }}
                />
                <Bar dataKey="workload" fill="#0D9488" radius={[0, 4, 4, 0]} name="Workload %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Quản lý Khóa học</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select 
                className="filter-select"
                value={filterCourseStatus}
                onChange={(e) => setFilterCourseStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang diễn ra</option>
                <option value="upcoming">Sắp tới</option>
                <option value="completed">Hoàn thành</option>
              </select>
              <button 
                onClick={() => openAddModal('course')}
                style={{
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                ➕ Thêm khóa học
              </button>
            </div>
          </div>

          {/* Course Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#0D9488', fontFamily: '"Space Grotesk", sans-serif' }}>
                {courses.filter(c => c.status === 'active').length}
              </div>
              <div style={{ fontSize: '13px', color: '#94A3B8' }}>Khóa học đang chạy</div>
            </div>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#3B82F6', fontFamily: '"Space Grotesk", sans-serif' }}>
                {totalStudents}
              </div>
              <div style={{ fontSize: '13px', color: '#94A3B8' }}>Tổng học viên</div>
            </div>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#F59E0B', fontFamily: '"Space Grotesk", sans-serif' }}>
                {formatCurrency(courses.reduce((sum, c) => sum + c.revenue, 0))}
              </div>
              <div style={{ fontSize: '13px', color: '#94A3B8' }}>Tổng doanh thu</div>
            </div>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#8B5CF6', fontFamily: '"Space Grotesk", sans-serif' }}>
                {courses.filter(c => c.status === 'upcoming').length}
              </div>
              <div style={{ fontSize: '13px', color: '#94A3B8' }}>Khóa học sắp tới</div>
            </div>
          </div>

          {/* Course Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {filteredCourses.map((course, index) => (
              <div key={course.id} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <span 
                      className="status-badge" 
                      style={{ 
                        background: course.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 
                                   course.status === 'upcoming' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                        color: course.status === 'active' ? '#10B981' : 
                               course.status === 'upcoming' ? '#3B82F6' : '#94A3B8',
                        marginBottom: '8px',
                        display: 'inline-block'
                      }}
                    >
                      {course.status === 'active' ? 'Đang diễn ra' : 
                       course.status === 'upcoming' ? 'Sắp tới' : 'Hoàn thành'}
                    </span>
                    <h4 style={{ margin: '8px 0 4px 0', fontSize: '16px', fontWeight: '600' }}>{course.name}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>👤 {course.instructor}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="action-btn edit" onClick={() => openEditModal('course', course)}>✏️</button>
                    <button className="action-btn delete" onClick={() => handleDelete('course', course.id)}>🗑️</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>Học viên</div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{course.students}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>Doanh thu</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#10B981' }}>{formatCurrency(course.revenue)}</div>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#94A3B8' }}>Tiến độ</span>
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{course.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${course.progress}%`,
                        background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`
                      }}
                    ></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                  <span>📅 {course.startDate}</span>
                  <span>→</span>
                  <span>{course.endDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Finance Tab */}
      {activeTab === 'finance' && (
        <div className="animate-in">
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>Tình hình Tài chính</h3>

          {/* Finance KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="kpi-card" style={{ '--accent-color': '#10B981' }}>
              <p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Tổng doanh thu YTD</p>
              <h2 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#10B981', fontFamily: '"Space Grotesk", sans-serif' }}>
                {totalRevenue}M
              </h2>
            </div>
            <div className="kpi-card" style={{ '--accent-color': '#EF4444' }}>
              <p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Tổng chi phí YTD</p>
              <h2 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#EF4444', fontFamily: '"Space Grotesk", sans-serif' }}>
                {financialData.reduce((sum, d) => sum + d.expenses, 0)}M
              </h2>
            </div>
            <div className="kpi-card" style={{ '--accent-color': '#F59E0B' }}>
              <p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Lợi nhuận YTD</p>
              <h2 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#F59E0B', fontFamily: '"Space Grotesk", sans-serif' }}>
                {financialData.reduce((sum, d) => sum + d.profit, 0)}M
              </h2>
            </div>
            <div className="kpi-card" style={{ '--accent-color': '#8B5CF6' }}>
              <p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Profit Margin</p>
              <h2 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#8B5CF6', fontFamily: '"Space Grotesk", sans-serif' }}>
                {Math.round(financialData.reduce((sum, d) => sum + d.profit, 0) / totalRevenue * 100)}%
              </h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {/* Revenue vs Expenses */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Doanh thu vs Chi phí</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10B981" name="Doanh thu" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#EF4444" name="Chi phí" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by Category */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Doanh thu theo danh mục (Triệu VNĐ)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={coursesByCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}M`}
                    labelLine={{ stroke: '#64748B' }}
                  >
                    {coursesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Forecast Section */}
          <div className="glass-card" style={{ padding: '24px', marginTop: '20px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔮 Dự báo Tài chính Q2/2025
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 20px 0' }}>
              Dựa trên xu hướng hiện tại và pipeline deals
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={[...financialData.slice(-3), ...forecastData]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} name="Doanh thu" />
                <Line type="monotone" dataKey="profit" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B' }} name="Lợi nhuận" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '24px', marginTop: '16px', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#94A3B8' }}>Dự báo doanh thu Q2</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981', fontFamily: '"Space Grotesk", sans-serif' }}>
                  {forecastData.reduce((sum, d) => sum + d.revenue, 0)}M
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#94A3B8' }}>Dự báo lợi nhuận Q2</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B', fontFamily: '"Space Grotesk", sans-serif' }}>
                  {forecastData.reduce((sum, d) => sum + d.profit, 0)}M
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#94A3B8' }}>Tăng trưởng dự kiến</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#8B5CF6', fontFamily: '"Space Grotesk", sans-serif' }}>
                  +36%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales Tab */}
      {activeTab === 'sales' && (
        <div className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Sales Pipeline - Leads & Deals</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select 
                className="filter-select"
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
              >
                <option value="all">Tất cả giai đoạn</option>
                <option value="discovery">Khám phá</option>
                <option value="qualification">Đánh giá</option>
                <option value="proposal">Đề xuất</option>
                <option value="negotiation">Đàm phán</option>
                <option value="closed-won">Thành công</option>
              </select>
              <button 
                onClick={() => openAddModal('lead')}
                style={{
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                ➕ Thêm Lead
              </button>
            </div>
          </div>

          {/* Pipeline Funnel */}
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Sales Funnel</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '600px', margin: '0 auto' }}>
              {pipelineStages.map((stage, index) => {
                const width = 100 - (index * 15);
                return (
                  <div 
                    key={stage.name}
                    style={{
                      width: `${width}%`,
                      margin: '0 auto',
                      padding: '16px 24px',
                      background: `linear-gradient(90deg, ${COLORS[index]}dd, ${COLORS[index]}88)`,
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: 'white',
                      fontWeight: '500'
                    }}
                  >
                    <span>{stage.name}</span>
                    <span>{stage.deals} deals • {stage.amount}M VNĐ</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deals Table */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div className="table-row" style={{ 
              gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 100px',
              background: 'rgba(15, 23, 42, 0.5)',
              fontWeight: '600',
              fontSize: '13px',
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <div>Công ty</div>
              <div>Liên hệ</div>
              <div>Giá trị</div>
              <div>Giai đoạn</div>
              <div>Xác suất</div>
              <div>Nguồn</div>
              <div>Thao tác</div>
            </div>
            
            {filteredLeads.map(lead => (
              <div 
                key={lead.id} 
                className="table-row"
                style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 100px' }}
              >
                <div style={{ fontWeight: '500' }}>{lead.company}</div>
                <div>
                  <div>{lead.contact}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{lead.email}</div>
                </div>
                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: '600', color: '#10B981' }}>
                  {formatCurrency(lead.value)}
                </div>
                <div>
                  <span 
                    className="status-badge"
                    style={{ 
                      background: `${STAGE_COLORS[lead.stage]}22`,
                      color: STAGE_COLORS[lead.stage]
                    }}
                  >
                    {getStageLabel(lead.stage)}
                  </span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="progress-bar" style={{ width: '60px' }}>
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${lead.probability}%`,
                          background: lead.probability >= 70 ? '#10B981' : lead.probability >= 40 ? '#F59E0B' : '#EF4444'
                        }}
                      ></div>
                    </div>
                    <span style={{ fontSize: '13px' }}>{lead.probability}%</span>
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: '#94A3B8' }}>{lead.source}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="action-btn edit" onClick={() => openEditModal('lead', lead)}>✏️</button>
                  <button className="action-btn delete" onClick={() => handleDelete('lead', lead.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>

          {/* Pipeline Analytics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '24px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Nguồn Leads</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Referral', value: leads.filter(l => l.source === 'Referral').length },
                      { name: 'Website', value: leads.filter(l => l.source === 'Website').length },
                      { name: 'Event', value: leads.filter(l => l.source === 'Event').length },
                      { name: 'LinkedIn', value: leads.filter(l => l.source === 'LinkedIn').length },
                      { name: 'Cold Call', value: leads.filter(l => l.source === 'Cold Call').length },
                    ].filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Pipeline Summary</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                  <span>Total Pipeline Value</span>
                  <span style={{ fontWeight: '600', color: '#10B981' }}>{formatCurrency(pipelineValue)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
                  <span>Weighted Pipeline</span>
                  <span style={{ fontWeight: '600', color: '#F59E0B' }}>{formatCurrency(weightedPipeline)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px' }}>
                  <span>Avg Deal Size</span>
                  <span style={{ fontWeight: '600', color: '#8B5CF6' }}>{formatCurrency(leads.length > 0 ? pipelineValue / leads.filter(l => !['closed-won', 'closed-lost'].includes(l.stage)).length : 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                  <span>Win Rate</span>
                  <span style={{ fontWeight: '600', color: '#3B82F6' }}>
                    {leads.length > 0 ? Math.round(leads.filter(l => l.stage === 'closed-won').length / leads.length * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        textAlign: 'center', 
        borderTop: '1px solid rgba(148, 163, 184, 0.1)',
        color: '#64748B',
        fontSize: '13px'
      }}>
        © 2025 AI Workforce Solutions • Dashboard v2.0 • Built with ❤️ for AIWS
      </div>

      {/* Modals */}
      <Modal 
        isOpen={modalType === 'employee'} 
        onClose={closeModal}
        title={editingItem ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
      >
        {renderEmployeeForm()}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button onClick={closeModal} style={{
            padding: '10px 20px',
            background: 'rgba(148, 163, 184, 0.2)',
            border: 'none',
            borderRadius: '8px',
            color: '#F1F5F9',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}>Hủy</button>
          <button onClick={handleSave} style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: '500'
          }}>💾 Lưu</button>
        </div>
      </Modal>

      <Modal 
        isOpen={modalType === 'course'} 
        onClose={closeModal}
        title={editingItem ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
      >
        {renderCourseForm()}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button onClick={closeModal} style={{
            padding: '10px 20px',
            background: 'rgba(148, 163, 184, 0.2)',
            border: 'none',
            borderRadius: '8px',
            color: '#F1F5F9',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}>Hủy</button>
          <button onClick={handleSave} style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: '500'
          }}>💾 Lưu</button>
        </div>
      </Modal>

      <Modal 
        isOpen={modalType === 'lead'} 
        onClose={closeModal}
        title={editingItem ? 'Chỉnh sửa Lead' : 'Thêm Lead mới'}
      >
        {renderLeadForm()}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button onClick={closeModal} style={{
            padding: '10px 20px',
            background: 'rgba(148, 163, 184, 0.2)',
            border: 'none',
            borderRadius: '8px',
            color: '#F1F5F9',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}>Hủy</button>
          <button onClick={handleSave} style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: '500'
          }}>💾 Lưu</button>
        </div>
      </Modal>
    </div>
  );
}
