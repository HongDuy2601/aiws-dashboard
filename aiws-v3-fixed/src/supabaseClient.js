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
  employees: {
    getAll: () => supabase.from('employees').select('*').order('id'),
    create: (data) => supabase.from('employees').insert(data).select(),
    update: (id, data) => supabase.from('employees').update(data).eq('id', id).select(),
    delete: (id) => supabase.from('employees').delete().eq('id', id),
  },
  courses: {
    getAll: () => supabase.from('courses').select('*').order('id'),
    create: (data) => supabase.from('courses').insert(data).select(),
    update: (id, data) => supabase.from('courses').update(data).eq('id', id).select(),
    delete: (id) => supabase.from('courses').delete().eq('id', id),
  },
  leads: {
    getAll: () => supabase.from('leads').select('*').order('id'),
    create: (data) => supabase.from('leads').insert(data).select(),
    update: (id, data) => supabase.from('leads').update(data).eq('id', id).select(),
    delete: (id) => supabase.from('leads').delete().eq('id', id),
  },
  financial: {
    getAll: () => supabase.from('financial_data').select('*').order('id'),
  },
  students: {
    getAll: () => supabase.from('students').select('*').order('id'),
    create: (data) => {
      const finalFee = (data.tuition_fee || 0) - (data.discount_amount || 0);
      return supabase.from('students').insert({ ...data, final_fee: finalFee }).select();
    },
    update: (id, data) => {
      if (data.tuition_fee !== undefined || data.discount_amount !== undefined) {
        data.final_fee = (data.tuition_fee || 0) - (data.discount_amount || 0);
      }
      return supabase.from('students').update(data).eq('id', id).select();
    },
    delete: (id) => supabase.from('students').delete().eq('id', id),
  },
};
