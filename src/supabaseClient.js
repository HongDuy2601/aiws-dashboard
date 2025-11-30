import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Auth helpers
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Database helpers
export const db = {
  // Employees
  employees: {
    getAll: () => supabase.from('employees').select('*').order('id'),
    getById: (id) => supabase.from('employees').select('*').eq('id', id).single(),
    create: (data) => supabase.from('employees').insert(data).select(),
    update: (id, data) => supabase.from('employees').update(data).eq('id', id).select(),
    delete: (id) => supabase.from('employees').delete().eq('id', id),
  },

  // Courses
  courses: {
    getAll: () => supabase.from('courses').select('*').order('id'),
    getById: (id) => supabase.from('courses').select('*').eq('id', id).single(),
    create: (data) => supabase.from('courses').insert(data).select(),
    update: (id, data) => supabase.from('courses').update(data).eq('id', id).select(),
    delete: (id) => supabase.from('courses').delete().eq('id', id),
  },

  // Leads
  leads: {
    getAll: () => supabase.from('leads').select('*').order('id'),
    getById: (id) => supabase.from('leads').select('*').eq('id', id).single(),
    create: (data) => supabase.from('leads').insert(data).select(),
    update: (id, data) => supabase.from('leads').update(data).eq('id', id).select(),
    delete: (id) => supabase.from('leads').delete().eq('id', id),
  },

  // Financial
  financial: {
    getAll: () => supabase.from('financial_data').select('*').order('id'),
    create: (data) => supabase.from('financial_data').insert(data).select(),
  },

  // Students
  students: {
    getAll: () => supabase.from('students').select('*').order('id'),
    getById: (id) => supabase.from('students').select('*').eq('id', id).single(),
    getByCourse: (courseId) => supabase.from('students').select('*').eq('course_id', courseId),
    getByStatus: (status) => supabase.from('students').select('*').eq('student_status', status),
    getByPaymentStatus: (status) => supabase.from('students').select('*').eq('payment_status', status),
    create: async (student) => {
      const finalFee = (student.tuition_fee || 0) - (student.discount_amount || 0);
      const data = { ...student, final_fee: finalFee };
      return supabase.from('students').insert(data).select();
    },
    update: async (id, updates) => {
      if (updates.tuition_fee !== undefined || updates.discount_amount !== undefined) {
        const tuition = updates.tuition_fee ?? 0;
        const discount = updates.discount_amount ?? 0;
        updates.final_fee = tuition - discount;
      }
      return supabase.from('students').update(updates).eq('id', id).select();
    },
    delete: (id) => supabase.from('students').delete().eq('id', id),
  },

  // Payment History
  paymentHistory: {
    getByStudent: (studentId) => supabase.from('payment_history').select('*').eq('student_id', studentId).order('payment_date', { ascending: false }),
    create: async (payment) => {
      const result = await supabase.from('payment_history').insert(payment).select();
      if (!result.error && payment.student_id) {
        const { data: student } = await db.students.getById(payment.student_id);
        if (student) {
          const newPaidAmount = (student.paid_amount || 0) + payment.amount;
          await db.students.update(payment.student_id, { paid_amount: newPaidAmount });
        }
      }
      return result;
    },
    delete: (id) => supabase.from('payment_history').delete().eq('id', id),
  },
};
