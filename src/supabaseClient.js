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

// Get user role from user_profiles table
export const getUserRole = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'staff';
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();
  
  if (error || !data) {
    // If no profile exists, create one with default role
    const { data: newProfile } = await supabase
      .from('user_profiles')
      .insert({ id: user.id, email: user.email, role: 'staff' })
      .select()
      .single();
    return newProfile?.role || 'staff';
  }
  
  return data.role || 'staff';
};

// Get user profile
export const getUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return data;
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
    create: async (data) => {
      const { data: { user } } = await supabase.auth.getUser();
      return supabase.from('leads').insert({ ...data, created_by: user?.id }).select();
    },
    update: (id, data) => supabase.from('leads').update(data).eq('id', id).select(),
    delete: (id) => supabase.from('leads').delete().eq('id', id),
  },
  financial: {
    getAll: () => supabase.from('financial_data').select('*').order('id'),
  },
  students: {
    getAll: () => supabase.from('students').select('*').order('id'),
    create: async (data) => {
      const { data: { user } } = await supabase.auth.getUser();
      const finalFee = (data.tuition_fee || 0) - (data.discount_amount || 0);
      return supabase.from('students').insert({ ...data, final_fee: finalFee, created_by: user?.id }).select();
    },
    update: (id, data) => {
      if (data.tuition_fee !== undefined || data.discount_amount !== undefined) {
        data.final_fee = (data.tuition_fee || 0) - (data.discount_amount || 0);
      }
      return supabase.from('students').update(data).eq('id', id).select();
    },
    delete: (id) => supabase.from('students').delete().eq('id', id),
  },
  userProfiles: {
    getAll: () => supabase.from('user_profiles').select('*').order('created_at'),
    update: (id, data) => supabase.from('user_profiles').update(data).eq('id', id).select(),
  },
};
