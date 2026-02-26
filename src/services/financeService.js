  import { supabase } from '../lib/supabase';

// ============ INCOME SERVICES ============
export const incomeService = {
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    return { data, error };
  },

  create: async (incomeData) => {
    const { data, error } = await supabase
      .from('incomes')
      .insert([incomeData])
      .select()
      .single();
    return { data, error };
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('incomes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  delete: async (id) => {
    const { error } = await supabase.from('incomes').delete().eq('id', id);
    return { error };
  },
};

// ============ EXPENSE SERVICES ============
export const expenseService = {
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    return { data, error };
  },

  create: async (expenseData) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expenseData])
      .select()
      .single();
    return { data, error };
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  delete: async (id) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    return { error };
  },
};

// ============ BUDGET SERVICES ============
export const budgetService = {
  getByMonth: async (userId, month) => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .single();
    return { data, error };
  },

  upsert: async (budgetData) => {
    const { data, error } = await supabase
      .from('budgets')
      .upsert([budgetData], { onConflict: 'user_id,month' })
      .select()
      .single();
    return { data, error };
  },
};

// ============ EXPENSE CATEGORIES ============
export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing & Rent',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Education',
  'Utilities',
  'Travel',
  'Personal Care',
  'Savings',
  'Other',
];

export const INCOME_SOURCES = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Rental Income',
  'Side Hustle',
  'Gift',
  'Other',
];

// Supported currencies
export const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee', locale: 'en-IN' },
  { code: 'USD', symbol: '$', label: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', label: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', label: 'British Pound', locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar', locale: 'en-CA' },
];

// Format currency — accepts optional currency code (defaults to INR)
export const formatCurrency = (amount, currency = 'INR') => {
  const cur = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  return new Intl.NumberFormat(cur.locale, {
    style: 'currency',
    currency: cur.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Format date
export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Get current month string YYYY-MM
export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// ============ PROFILE SERVICES ============
export const profileService = {
  get: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    return { data, error };
  },

  upsert: async (profileData) => {
    const { data, error } = await supabase
      .from('profiles')
      .upsert([{ ...profileData, updated_at: new Date().toISOString() }], { onConflict: 'user_id' })
      .select()
      .single();
    return { data, error };
  },

  uploadAvatar: async (userId, file) => {
    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });
    if (uploadError) return { data: null, error: uploadError };
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return { data: data.publicUrl, error: null };
  },
};

// ============ NOTIFICATION SERVICES ============
export const notificationService = {
  getUnread: async (userId) => {
    const { data, error } = await supabase
      .from('notification_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    return { data, error };
  },

  create: async (userId, type, message) => {
    const { data, error } = await supabase
      .from('notification_logs')
      .insert([{ user_id: userId, type, message }])
      .select()
      .single();
    return { data, error };
  },

  markAllRead: async (userId) => {
    const { error } = await supabase
      .from('notification_logs')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    return { error };
  },
};

// ============ IOU SERVICES ============
export const iouService = {
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('ious')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  create: async (iouData) => {
    const { data, error } = await supabase
      .from('ious')
      .insert([iouData])
      .select()
      .single();
    return { data, error };
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('ious')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  delete: async (id) => {
    const { error } = await supabase.from('ious').delete().eq('id', id);
    return { error };
  },
};
