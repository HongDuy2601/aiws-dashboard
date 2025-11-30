import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import { db } from './supabaseClient';
import StudentsTab, { renderStudentForm } from './StudentsTab';

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
// TOAST NOTIFICATION
// ============================================
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      padding: '16px 24px',
      borderRadius: '12px',
      background: type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      animation: 'slideIn 0.3s ease'
    }}>
      {type === 'success' ? '✅' : '❌'} {message}
    </div>
  );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
export default function AIWSDashboard({ user, onLogout }) {
  // State for data from Supabase
  const [employees, setEmployees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [leads, setLeads] = useState([]);
  const [students, setStudents] = useState([]);
  const [financialData, setFinancialData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [filterCourseStatus, setFilterCourseStatus] = useState('all');
  
  // Modal State
  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({});
  
  // Toast State
  const [toast, setToast] = useState(null);

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
  // FETCH DATA FROM SUPABASE
  // ============================================
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
        const actual = finRes.data.filter(d => !d.is_forecast).map(d => ({
          month: d.month,
          revenue: Number(d.revenue),
          expenses: Number(d.expenses),
          profit: Number(d.profit),
          courses: d.courses_count
        }));
        const forecast = finRes.data.filter(d => d.is_forecast).map(d => ({
          month: d.month,
          revenue: Number(d.revenue),
          expenses: Number(d.expenses),
          profit: Number(d.profit),
          type: 'forecast'
        }));
        setFinancialData({ actual, forecast });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Lỗi khi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // ============================================
  // CRUD FUNCTIONS WITH SUPABASE
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

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modalType === 'employee') {
        const employeeData = {
          name: formData.name,
          role: formData.role,
          department: formData.department,
          status: formData.status || 'active',
          workload: parseInt(formData.workload) || 0,
          courses: parseInt(formData.courses) || 0,
          performance: parseInt(formData.performance) || 0,
          salary: parseInt(formData.salary) || 0
        };
        
        if (editingItem) {
          const { error } = await db.employees.update(editingItem.id, employeeData);
          if (error) throw error;
          showToast('Cập nhật nhân viên thành công!');
        } else {
          const { error } = await db.employees.create(employeeData);
          if (error) throw error;
          showToast('Thêm nhân viên thành công!');
        }
        const { data } = await db.employees.getAll();
        if (data) setEmployees(data);
        
      } else if (modalType === 'course') {
        const courseData = {
          name: formData.name,
          instructor: formData.instructor,
          category: formData.category,
          start_date: formData.start_date || formData.startDate,
          end_date: formData.end_date || formData.endDate,
          students: parseInt(formData.students) || 0,
          progress: parseInt(formData.progress) || 0,
          revenue: parseInt(formData.revenue) || 0,
          status: formData.status || 'upcoming'
        };
        
        if (editingItem) {
          const { error } = await db.courses.update(editingItem.id, courseData);
          if (error) throw error;
          showToast('Cập nhật khóa học thành công!');
        } else {
          const { error } = await db.courses.create(courseData);
          if (error) throw error;
          showToast('Thêm khóa học thành công!');
        }
        const { data } = await db.courses.getAll();
        if (data) setCourses(data);
        
      } else if (modalType === 'lead') {
        const leadData = {
          company: formData.company,
          contact: formData.contact,
          email: formData.email,
          phone: formData.phone,
          value: parseInt(formData.value) || 0,
          stage: formData.stage || 'discovery',
          probability: parseInt(formData.probability) || 0,
          source: formData.source,
          notes: formData.notes
        };
        
        if (editingItem) {
          const { error } = await db.leads.update(editingItem.id, leadData);
          if (error) throw error;
          showToast('Cập nhật lead thành công!');
        } else {
          const { error } = await db.leads.create(leadData);
          if (error) throw error;
          showToast('Thêm lead thành công!');
        }
        const { data } = await db.leads.getAll();
        if (data) setLeads(data);

      } else if (modalType === 'student') {
        const studentData = {
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          address: formData.address,
          city: formData.city,
          occupation: formData.occupation,
          company: formData.company,
          course_id: parseInt(formData.course_id) || null,
          course_name: formData.course_name,
          enrollment_date: formData.enrollment_date || new Date().toISOString().split('T')[0],
          start_date: formData.start_date,
          tuition_fee: parseInt(formData.tuition_fee) || 0,
          discount_amount: parseInt(formData.discount_amount) || 0,
          final_fee: parseInt(formData.final_fee) || (parseInt(formData.tuition_fee) || 0) - (parseInt(formData.discount_amount) || 0),
          paid_amount: parseInt(formData.paid_amount) || 0,
          discount_reason: formData.discount_reason,
          payment_method: formData.payment_method,
          source: formData.source,
          referral_by: formData.referral_by,
          campaign: formData.campaign,
          student_status: formData.student_status || 'active',
          assigned_instructor: formData.assigned_instructor,
          notes: formData.notes
        };
        
        if (editingItem) {
          const { error } = await db.students.update(editingItem.id, studentData);
          if (error) throw error;
          showToast('Cập nhật học viên thành công!');
        } else {
          const { error } = await db.students.create(studentData);
          if (error) throw error;
          showToast('Thêm học viên thành công!');
        }
        const { data } = await db.students.getAll();
        if (data) setStudents(data);
      }
      
      closeModal();
    } catch (error) {
      console.error('Error saving:', error);
      showToast('Lỗi khi lưu dữ liệu: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    
    try {
      if (type === 'employee') {
        const { error } = await db.employees.delete(id);
        if (error) throw error;
        setEmployees(employees.filter(e => e.id !== id));
        showToast('Đã xóa nhân viên!');
      } else if (type === 'course') {
        const { error } = await db.courses.delete(id);
        if (error) throw error;
        setCourses(courses.filter(c => c.id !== id));
        showToast('Đã xóa khóa học!');
      } else if (type === 'lead') {
        const { error } = await db.leads.delete(id);
        if (error) throw error;
        setLeads(leads.filter(l => l.id !== id));
        showToast('Đã xóa lead!');
      } else if (type === 'student') {
        const { error } = await db.students.delete(id);
        if (error) throw error;
        setStudents(students.filter(s => s.id !== id));
        showToast('Đã xóa học viên!');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      showToast('Lỗi khi xóa: ' + error.message, 'error');
    }
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
          'Ngày bắt đầu': c.start_date,
          'Ngày kết thúc': c.end_date,
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
          'Ghi chú': l.notes
        }));
        fileName = 'AIWS_Leads';
        break;
      case 'students':
        data = students.map(s => ({
          'Họ tên': s.full_name,
          'Số điện thoại': s.phone,
          'Email': s.email,
          'Khóa học': s.course_name,
          'Ngày đăng ký': s.enrollment_date,
          'Học phí gốc': s.tuition_fee,
          'Giảm giá': s.discount_amount,
          'Phải đóng': s.final_fee,
          'Đã đóng': s.paid_amount,
          'Còn lại': s.remaining_amount,
          'Trạng thái TT': s.payment_status === 'paid' ? 'Đã đóng đủ' : s.payment_status === 'partial' ? 'Đóng 1 phần' : 'Chưa đóng',
          'Trạng thái học': s.student_status === 'active' ? 'Đang học' : s.student_status === 'completed' ? 'Hoàn thành' : s.student_status,
          'Nguồn': s.source,
          'Người giới thiệu': s.referral_by,
          'Ghi chú': s.notes
        }));
        fileName = 'AIWS_HocVien';
        break;
      case 'all':
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

        const studentSheet = XLSX.utils.json_to_sheet(students.map(s => ({
          'Họ tên': s.full_name, 'SĐT': s.phone, 'Email': s.email, 'Khóa học': s.course_name,
          'Học phí': s.tuition_fee, 'Đã đóng': s.paid_amount, 'Còn lại': s.remaining_amount,
          'Trạng thái TT': s.payment_status, 'Nguồn': s.source
        })));
        XLSX.utils.book_append_sheet(wb, studentSheet, 'Học viên');
        
        const leadsSheet = XLSX.utils.json_to_sheet(leads.map(l => ({
          'Công ty': l.company, 'Người liên hệ': l.contact, 'Email': l.email,
          'Giá trị (VNĐ)': l.value, 'Giai đoạn': getStageLabel(l.stage), 'Xác suất (%)': l.probability
        })));
        XLSX.utils.book_append_sheet(wb, leadsSheet, 'Leads');
        
        XLSX.writeFile(wb, `AIWS_BaoCaoTongHop_${new Date().toISOString().split('T')[0]}.xlsx`);
        setShowExportMenu(false);
        showToast('Xuất báo cáo thành công!');
        return;
      default:
        return;
    }
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    setShowExportMenu(false);
    showToast('Xuất báo cáo thành công!');
  };

  // ============================================
  // CALCULATIONS
  // ============================================
  const actualFinancial = financialData.actual || [];
  const forecastFinancial = financialData.forecast || [];
  
  const totalRevenue = actualFinancial.reduce((sum, d) => sum + d.revenue, 0);
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.student_status === 'active').length;
  const activeCourses = courses.filter(c => c.status === 'active');
  const avgCourseProgress = activeCourses.length > 0 
    ? Math.round(activeCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / activeCourses.length) 
    : 0;
  const pipelineValue = leads.filter(l => l.stage !== 'closed-won' && l.stage !== 'closed-lost').reduce((sum, l) => sum + (l.value || 0), 0);
  const weightedPipeline = leads.filter(l => l.stage !== 'closed-won' && l.stage !== 'closed-lost').reduce((sum, l) => sum + ((l.value || 0) * (l.probability || 0) / 100), 0);

  // Student financial stats
  const studentStats = useMemo(() => {
    const totalTuition = students.reduce((sum, s) => sum + (s.final_fee || s.tuition_fee || 0), 0);
    const totalPaid = students.reduce((sum, s) => sum + (s.paid_amount || 0), 0);
    const totalRemaining = students.reduce((sum, s) => sum + (s.remaining_amount || 0), 0);
    return { totalTuition, totalPaid, totalRemaining };
  }, [students]);

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
      cat[c.category] = (cat[c.category] || 0) + (c.revenue || 0);
    });
    return Object.entries(cat).map(([name, value]) => ({ name, value: value / 1000000 }));
  }, [courses]);

  const pipelineStages = useMemo(() => {
    const stages = ['discovery', 'qualification', 'proposal', 'negotiation', 'closed-won'];
    return stages.map(stage => {
      const stageLeads = leads.filter(l => l.stage === stage);
      return {
        name: getStageLabel(stage),
        key: stage,
        deals: stageLeads.length,
        amount: Math.round(stageLeads.reduce((sum, l) => sum + (l.value || 0), 0) / 1000000)
      };
    });
  }, [leads]);

  const formatCurrency = (value) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    return value?.toLocaleString('vi-VN') || '0';
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
    { id: 'students', label: 'Học viên', icon: '🎓' },
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
        <FormInput label="Lương (VNĐ)" type="number" value={formData.salary || ''} onChange={e => setFormData({...formData, salary: e.target.value})} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <FormInput label="Workload (%)" type="number" value={formData.workload || ''} onChange={e => setFormData({...formData, workload: e.target.value})} />
        <FormInput label="Số khóa dạy" type="number" value={formData.courses || ''} onChange={e => setFormData({...formData, courses: e.target.value})} />
        <FormInput label="Performance (%)" type="number" value={formData.performance || ''} onChange={e => setFormData({...formData, performance: e.target.value})} />
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
        <FormInput label="Ngày bắt đầu" type="date" value={formData.start_date || formData.startDate || ''} onChange={e => setFormData({...formData, start_date: e.target.value})} required />
        <FormInput label="Ngày kết thúc" type="date" value={formData.end_date || formData.endDate || ''} onChange={e => setFormData({...formData, end_date: e.target.value})} required />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <FormInput label="Số học viên" type="number" value={formData.students || ''} onChange={e => setFormData({...formData, students: e.target.value})} />
        <FormInput label="Tiến độ (%)" type="number" value={formData.progress || ''} onChange={e => setFormData({...formData, progress: e.target.value})} />
        <FormInput label="Doanh thu (VNĐ)" type="number" value={formData.revenue || ''} onChange={e => setFormData({...formData, revenue: e.target.value})} />
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
        <FormInput label="Giá trị deal (VNĐ)" type="number" value={formData.value || ''} onChange={e => setFormData({...formData, value: e.target.value})} required />
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
        <FormInput label="Xác suất (%)" type="number" value={formData.probability || ''} onChange={e => setFormData({...formData, probability: e.target.value})} />
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

  // Loading State
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#F1F5F9',
        fontFamily: '"DM Sans", system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(13, 148, 136, 0.3)',
            borderTopColor: '#0D9488',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Đang tải dữ liệu từ database...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

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
        
        .tab-btn:hover { background: rgba(148, 163, 184, 0.1); color: #F1F5F9; }
        .tab-btn.active { background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); color: white; }
        
        .progress-bar { height: 8px; background: rgba(148, 163, 184, 0.2); border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
        
        .table-row {
          display: grid;
          padding: 16px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          align-items: center;
          transition: background 0.2s ease;
        }
        .table-row:hover { background: rgba(148, 163, 184, 0.05); }
        
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
        
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
        .filter-select:focus { border-color: #0D9488; }
        
        .action-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .action-btn:hover { transform: scale(1.05); }
        .action-btn.edit { background: rgba(59, 130, 246, 0.2); color: #60A5FA; }
        .action-btn.delete { background: rgba(239, 68, 68, 0.2); color: #EF4444; }
        
        .metric-trend { display: flex; align-items: center; gap: 4px; font-size: 13px; }
        .metric-trend.up { color: #10B981; }
        .metric-trend.down { color: #EF4444; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-in { animation: fadeIn 0.4s ease forwards; }
        
        .pipeline-stage { padding: 16px; border-radius: 12px; text-align: center; transition: all 0.3s ease; }
        .pipeline-stage:hover { transform: scale(1.02); }
        
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
        .dropdown-item:hover { background: rgba(148, 163, 184, 0.1); }
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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Export Button */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => { setShowExportMenu(!showExportMenu); setShowUserMenu(false); }}
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
                <div className="dropdown-item" onClick={() => exportToExcel('all')}>📊 Xuất tất cả (Excel)</div>
                <div className="dropdown-item" onClick={() => exportToExcel('students')}>🎓 Xuất Học viên</div>
                <div className="dropdown-item" onClick={() => exportToExcel('employees')}>👥 Xuất Nhân sự</div>
                <div className="dropdown-item" onClick={() => exportToExcel('courses')}>📚 Xuất Khóa học</div>
                <div className="dropdown-item" onClick={() => exportToExcel('leads')}>🎯 Xuất Leads</div>
              </div>
            )}
          </div>
          
          {/* Add Button */}
          <button 
            onClick={() => {
              if (activeTab === 'students') openAddModal('student');
              else if (activeTab === 'employees') openAddModal('employee');
              else if (activeTab === 'courses') openAddModal('course');
              else if (activeTab === 'sales') openAddModal('lead');
              else openAddModal('student');
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

          {/* User Menu */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => { setShowUserMenu(!showUserMenu); setShowExportMenu(false); }}
              style={{
                padding: '10px 16px',
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
              👤 {user?.email?.split('@')[0]}
            </button>
            {showUserMenu && (
              <div className="dropdown-menu">
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', fontSize: '13px', color: '#94A3B8' }}>
                  {user?.email}
                </div>
                <div className="dropdown-item" onClick={() => fetchAllData()}>
                  🔄 Refresh dữ liệu
                </div>
                <div className="dropdown-item" onClick={onLogout} style={{ color: '#EF4444' }}>
                  🚪 Đăng xuất
                </div>
              </div>
            )}
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
        width: 'fit-content',
        flexWrap: 'wrap'
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

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="animate-in">
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="kpi-card" style={{ '--accent-color': '#0D9488' }}>
              <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Tổng doanh thu</p>
              <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0, fontFamily: '"Space Grotesk", sans-serif' }}>{totalRevenue}M</h2>
              <div className="metric-trend up" style={{ marginTop: '8px' }}><span>↑</span> 15.2% vs tháng trước</div>
            </div>

            <div className="kpi-card" style={{ '--accent-color': '#3B82F6' }}>
              <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Học viên</p>
              <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0, fontFamily: '"Space Grotesk", sans-serif' }}>{totalStudents}</h2>
              <div className="metric-trend up" style={{ marginTop: '8px' }}><span>↑</span> {activeStudents} đang học</div>
            </div>

            <div className="kpi-card" style={{ '--accent-color': '#10B981' }}>
              <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Học phí đã thu</p>
              <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0, fontFamily: '"Space Grotesk", sans-serif', color: '#10B981' }}>{formatCurrency(studentStats.totalPaid)}</h2>
              <div style={{ color: '#94A3B8', fontSize: '13px', marginTop: '8px' }}>Còn nợ: {formatCurrency(studentStats.totalRemaining)}</div>
            </div>

            <div className="kpi-card" style={{ '--accent-color': '#F59E0B' }}>
              <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Pipeline Value</p>
              <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0, fontFamily: '"Space Grotesk", sans-serif' }}>{formatCurrency(pipelineValue)}</h2>
              <div style={{ color: '#94A3B8', fontSize: '13px', marginTop: '8px' }}>Weighted: {formatCurrency(weightedPipeline)}</div>
            </div>

            <div className="kpi-card" style={{ '--accent-color': '#8B5CF6' }}>
              <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Tiến độ TB</p>
              <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0, fontFamily: '"Space Grotesk", sans-serif' }}>{avgCourseProgress}%</h2>
              <div className="progress-bar" style={{ width: '120px', marginTop: '12px' }}>
                <div className="progress-fill" style={{ width: `${avgCourseProgress}%`, background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)' }}></div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>
                <span style={{ color: '#0D9488' }}>●</span> Doanh thu & Dự báo (Triệu VNĐ)
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={[...actualFinancial, ...forecastFinancial]}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#0D9488" strokeWidth={2} fill="url(#revenueGradient)" name="Doanh thu" />
                  <Area type="monotone" dataKey="profit" stroke="#F59E0B" strokeWidth={2} fill="transparent" strokeDasharray="5 5" name="Lợi nhuận" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>
                <span style={{ color: '#3B82F6' }}>●</span> Phân bổ nhân sự theo phòng ban
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={departmentDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
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
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>
              <span style={{ color: '#8B5CF6' }}>●</span> Sales Pipeline Overview
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              {pipelineStages.map((stage, index) => (
                <div key={stage.key} className="pipeline-stage" style={{ 
                  background: `linear-gradient(135deg, ${COLORS[index]}22, ${COLORS[index]}11)`,
                  border: `1px solid ${COLORS[index]}44`
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS[index], fontFamily: '"Space Grotesk", sans-serif' }}>{stage.deals}</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>{stage.name}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{stage.amount}M</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STUDENTS TAB */}
      {activeTab === 'students' && (
        <StudentsTab
          students={students}
          courses={courses}
          onAdd={() => openAddModal('student')}
          onEdit={(student) => openEditModal('student', student)}
          onDelete={(id) => handleDelete('student', id)}
          formData={formData}
          setFormData={setFormData}
          editingItem={editingItem}
          saving={saving}
        />
      )}

      {/* EMPLOYEES TAB */}
      {activeTab === 'employees' && (
        <div className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Quản lý Nhân sự & Giảng viên ({employees.length})</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select className="filter-select" value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                <option value="all">Tất cả phòng ban</option>
                <option value="AI Training">AI Training</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
              </select>
              <button onClick={() => openAddModal('employee')} style={{
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontFamily: 'inherit',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                ➕ Thêm nhân viên
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ overflow: 'hidden' }}>
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
              <div key={emp.id} className="table-row" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 120px' }}>
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
                    {emp.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '500' }}>{emp.name}</div>
                    <div style={{ fontSize: '13px', color: '#94A3B8' }}>{emp.role}</div>
                  </div>
                </div>
                <div>{emp.department}</div>
                <div>
                  <span className="status-badge" style={{ 
                    background: emp.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: emp.status === 'active' ? '#10B981' : '#F59E0B'
                  }}>
                    {emp.status === 'active' ? 'Đang làm' : 'Nghỉ phép'}
                  </span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ 
                        width: `${emp.workload}%`,
                        background: emp.workload > 80 ? '#EF4444' : emp.workload > 60 ? '#F59E0B' : '#10B981'
                      }}></div>
                    </div>
                    <span style={{ fontSize: '13px', width: '35px' }}>{emp.workload}%</span>
                  </div>
                </div>
                <div>
                  <span style={{ color: emp.performance >= 90 ? '#10B981' : emp.performance >= 80 ? '#F59E0B' : '#EF4444', fontWeight: '600' }}>
                    {emp.performance}%
                  </span>
                </div>
                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: '500' }}>
                  {((emp.salary || 0) / 1000000).toFixed(0)}M
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="action-btn edit" onClick={() => openEditModal('employee', emp)}>✏️ Sửa</button>
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
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Quản lý Khóa học ({courses.length})</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select className="filter-select" value={filterCourseStatus} onChange={(e) => setFilterCourseStatus(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang diễn ra</option>
                <option value="upcoming">Sắp tới</option>
                <option value="completed">Hoàn thành</option>
              </select>
              <button onClick={() => openAddModal('course')} style={{
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontFamily: 'inherit',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                ➕ Thêm khóa học
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            {filteredCourses.map((course, index) => (
              <div key={course.id} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <span className="status-badge" style={{ 
                      background: course.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : course.status === 'upcoming' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                      color: course.status === 'active' ? '#10B981' : course.status === 'upcoming' ? '#3B82F6' : '#94A3B8',
                      marginBottom: '8px',
                      display: 'inline-block'
                    }}>
                      {course.status === 'active' ? 'Đang diễn ra' : course.status === 'upcoming' ? 'Sắp tới' : 'Hoàn thành'}
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
                    <div className="progress-fill" style={{ 
                      width: `${course.progress}%`,
                      background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`
                    }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FINANCE TAB */}
      {activeTab === 'finance' && (
        <div className="animate-in">
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>Tình hình Tài chính</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="kpi-card" style={{ '--accent-color': '#10B981' }}>
              <p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Học phí đã thu</p>
              <h2 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#10B981', fontFamily: '"Space Grotesk", sans-serif' }}>{formatCurrency(studentStats.totalPaid)}</h2>
            </div>
            <div className="kpi-card" style={{ '--accent-color': '#EF4444' }}>
              <p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Học phí còn nợ</p>
              <h2 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#EF4444', fontFamily: '"Space Grotesk", sans-serif' }}>{formatCurrency(studentStats.totalRemaining)}</h2>
            </div>
            <div className="kpi-card" style={{ '--accent-color': '#3B82F6' }}>
              <p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Doanh thu Courses</p>
              <h2 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#3B82F6', fontFamily: '"Space Grotesk", sans-serif' }}>{totalRevenue}M</h2>
            </div>
            <div className="kpi-card" style={{ '--accent-color': '#8B5CF6' }}>
              <p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Tỷ lệ thu HP</p>
              <h2 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#8B5CF6', fontFamily: '"Space Grotesk", sans-serif' }}>
                {studentStats.totalTuition > 0 ? Math.round(studentStats.totalPaid / studentStats.totalTuition * 100) : 0}%
              </h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Doanh thu vs Chi phí</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={actualFinancial}>
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

            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Doanh thu theo danh mục</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={coursesByCategory} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}M`} labelLine={{ stroke: '#64748B' }}>
                    {coursesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SALES TAB */}
      {activeTab === 'sales' && (
        <div className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Sales Pipeline ({leads.length} leads)</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select className="filter-select" value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
                <option value="all">Tất cả giai đoạn</option>
                <option value="discovery">Khám phá</option>
                <option value="qualification">Đánh giá</option>
                <option value="proposal">Đề xuất</option>
                <option value="negotiation">Đàm phán</option>
                <option value="closed-won">Thành công</option>
              </select>
              <button onClick={() => openAddModal('lead')} style={{
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontFamily: 'inherit',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                ➕ Thêm Lead
              </button>
            </div>
          </div>

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
              <div key={lead.id} className="table-row" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 100px' }}>
                <div style={{ fontWeight: '500' }}>{lead.company}</div>
                <div>
                  <div>{lead.contact}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{lead.email}</div>
                </div>
                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: '600', color: '#10B981' }}>
                  {formatCurrency(lead.value)}
                </div>
                <div>
                  <span className="status-badge" style={{ background: `${STAGE_COLORS[lead.stage]}22`, color: STAGE_COLORS[lead.stage] }}>
                    {getStageLabel(lead.stage)}
                  </span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="progress-bar" style={{ width: '60px' }}>
                      <div className="progress-fill" style={{ 
                        width: `${lead.probability}%`,
                        background: lead.probability >= 70 ? '#10B981' : lead.probability >= 40 ? '#F59E0B' : '#EF4444'
                      }}></div>
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
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '40px', padding: '20px', textAlign: 'center', borderTop: '1px solid rgba(148, 163, 184, 0.1)', color: '#64748B', fontSize: '13px' }}>
        © 2025 AI Workforce Solutions • Dashboard v3.0 with Supabase • Built for AIWS
      </div>

      {/* Modals */}
      <Modal isOpen={modalType === 'employee'} onClose={closeModal} title={editingItem ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}>
        {renderEmployeeForm()}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button onClick={closeModal} style={{ padding: '10px 20px', background: 'rgba(148, 163, 184, 0.2)', border: 'none', borderRadius: '8px', color: '#F1F5F9', cursor: 'pointer', fontFamily: 'inherit' }}>Hủy</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', border: 'none', borderRadius: '8px', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: '500', opacity: saving ? 0.7 : 1 }}>
            {saving ? '⏳ Đang lưu...' : '💾 Lưu'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={modalType === 'course'} onClose={closeModal} title={editingItem ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}>
        {renderCourseForm()}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button onClick={closeModal} style={{ padding: '10px 20px', background: 'rgba(148, 163, 184, 0.2)', border: 'none', borderRadius: '8px', color: '#F1F5F9', cursor: 'pointer', fontFamily: 'inherit' }}>Hủy</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', border: 'none', borderRadius: '8px', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: '500', opacity: saving ? 0.7 : 1 }}>
            {saving ? '⏳ Đang lưu...' : '💾 Lưu'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={modalType === 'lead'} onClose={closeModal} title={editingItem ? 'Chỉnh sửa Lead' : 'Thêm Lead mới'}>
        {renderLeadForm()}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button onClick={closeModal} style={{ padding: '10px 20px', background: 'rgba(148, 163, 184, 0.2)', border: 'none', borderRadius: '8px', color: '#F1F5F9', cursor: 'pointer', fontFamily: 'inherit' }}>Hủy</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', border: 'none', borderRadius: '8px', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: '500', opacity: saving ? 0.7 : 1 }}>
            {saving ? '⏳ Đang lưu...' : '💾 Lưu'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={modalType === 'student'} onClose={closeModal} title={editingItem ? 'Chỉnh sửa học viên' : 'Thêm học viên mới'} wide>
        {renderStudentForm(formData, setFormData, courses)}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button onClick={closeModal} style={{ padding: '10px 20px', background: 'rgba(148, 163, 184, 0.2)', border: 'none', borderRadius: '8px', color: '#F1F5F9', cursor: 'pointer', fontFamily: 'inherit' }}>Hủy</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', border: 'none', borderRadius: '8px', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: '500', opacity: saving ? 0.7 : 1 }}>
            {saving ? '⏳ Đang lưu...' : '💾 Lưu'}
          </button>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
