import { createClient } from '@supabase/supabase-js';

// ⚠️ THAY THẾ BẰNG CREDENTIALS CỦA BẠN
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
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
    getAll: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('id', { ascending: true });
      return { data, error };
    },
    create: async (employee) => {
      const { data, error } = await supabase
        .from('employees')
        .insert([employee])
        .select()
        .single();
      return { data, error };
    },
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    delete: async (id) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  // Courses
  courses: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('id', { ascending: true });
      return { data, error };
    },
    create: async (course) => {
      const { data, error } = await supabase
        .from('courses')
        .insert([course])
        .select()
        .single();
      return { data, error };
    },
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    delete: async (id) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  // Leads
  leads: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('id', { ascending: true });
      return { data, error };
    },
    create: async (lead) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([lead])
        .select()
        .single();
      return { data, error };
    },
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    delete: async (id) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  // Students - NEW
  students: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    },
    getById: async (id) => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },
    getByCourse: async (courseId) => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('course_id', courseId)
        .order('full_name', { ascending: true });
      return { data, error };
    },
    getByStatus: async (status) => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('student_status', status)
        .order('created_at', { ascending: false });
      return { data, error };
    },
    getByPaymentStatus: async (paymentStatus) => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('payment_status', paymentStatus)
        .order('created_at', { ascending: false });
      return { data, error };
    },
    create: async (student) => {
      // Calculate final_fee if not provided
      if (!student.final_fee && student.tuition_fee) {
        student.final_fee = student.tuition_fee - (student.discount_amount || 0);
      }
      const { data, error } = await supabase
        .from('students')
        .insert([student])
        .select()
        .single();
      return { data, error };
    },
    update: async (id, updates) => {
      // Recalculate final_fee if tuition or discount changed
      if (updates.tuition_fee !== undefined || updates.discount_amount !== undefined) {
        const tuition = updates.tuition_fee || 0;
        const discount = updates.discount_amount || 0;
        updates.final_fee = tuition - discount;
      }
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    delete: async (id) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      return { error };
    },
    // Statistics
    getStats: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('student_status, payment_status, tuition_fee, paid_amount, remaining_amount');
      
      if (error) return { data: null, error };
      
      const stats = {
        total: data.length,
        active: data.filter(s => s.student_status === 'active').length,
        completed: data.filter(s => s.student_status === 'completed').length,
        dropped: data.filter(s => s.student_status === 'dropped').length,
        totalTuition: data.reduce((sum, s) => sum + (s.tuition_fee || 0), 0),
        totalPaid: data.reduce((sum, s) => sum + (s.paid_amount || 0), 0),
        totalRemaining: data.reduce((sum, s) => sum + (s.remaining_amount || 0), 0),
        paidFull: data.filter(s => s.payment_status === 'paid').length,
        paidPartial: data.filter(s => s.payment_status === 'partial').length,
        unpaid: data.filter(s => s.payment_status === 'unpaid').length,
      };
      
      return { data: stats, error: null };
    },
  },

  // Payment History - NEW
  paymentHistory: {
    getByStudent: async (studentId) => {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('student_id', studentId)
        .order('payment_date', { ascending: false });
      return { data, error };
    },
    create: async (payment) => {
      const { data, error } = await supabase
        .from('payment_history')
        .insert([payment])
        .select()
        .single();
      
      // Update student paid_amount
      if (!error && data) {
        const { data: student } = await supabase
          .from('students')
          .select('paid_amount')
          .eq('id', payment.student_id)
          .single();
        
        if (student) {
          await supabase
            .from('students')
            .update({ paid_amount: (student.paid_amount || 0) + payment.amount })
            .eq('id', payment.student_id);
        }
      }
      
      return { data, error };
    },
    delete: async (id) => {
      const { error } = await supabase
        .from('payment_history')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  // Financial Data
  financial: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('financial_data')
        .select('*')
        .order('id', { ascending: true });
      return { data, error };
    },
  },
};

// Realtime subscriptions
export const subscribeToTable = (table, callback) => {
  const subscription = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: table },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
  
  return subscription;
};

export const unsubscribe = (subscription) => {
  supabase.removeChannel(subscription);
};
