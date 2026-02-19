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

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
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
