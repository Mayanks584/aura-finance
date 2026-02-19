import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToastNotify } from '../context/ToastContext';
import { expenseService, EXPENSE_CATEGORIES, formatDate } from '../services/financeService';
import { ScrollReveal } from '../components/AnimatedBackground';
import {
  RiAddLine, RiCloseLine, RiEditLine, RiDeleteBinLine,
  RiShoppingBagLine, RiCalendarLine, RiFilterLine,
} from 'react-icons/ri';

// Category color mapping
const CATEGORY_COLORS = {
  'Food & Dining': '#f59e0b',
  'Transportation': '#3b82f6',
  'Housing & Rent': '#8b5cf6',
  'Entertainment': '#ec4899',
  'Shopping': '#06b6d4',
  'Healthcare': '#10b981',
  'Education': '#6366f1',
  'Utilities': '#f97316',
  'Travel': '#14b8a6',
  'Personal Care': '#a855f7',
  'Savings': '#22c55e',
  'Other': '#6b7280',
};

// Modal (reused)
const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative w-full max-w-md card-glass p-6 z-10"
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <motion.button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center" whileTap={{ scale: 0.9 }}>
              <RiCloseLine />
            </motion.button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Expense Form
const ExpenseForm = ({ initial, onSubmit, loading }) => {
  const [form, setForm] = useState({
    amount: initial?.amount || '',
    category: initial?.category || '',
    date: initial?.date || new Date().toISOString().split('T')[0],
    description: initial?.description || '',
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!form.amount || !form.category) return; onSubmit(form); }} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Amount (₹)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
          <input
            type="number"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-white/60 text-foreground text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
            placeholder="0" required
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Category</label>
        <select
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white/60 text-foreground text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
          required
        >
          <option value="">Select category...</option>
          {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white/60 text-foreground text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Description (optional)</label>
        <input
          type="text"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white/60 text-foreground text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
          placeholder="Add a note..."
        />
      </div>
      <motion.button
        type="submit" disabled={loading}
        className="w-full py-3.5 rounded-xl gradient-expense text-white font-bold text-sm shadow-md disabled:opacity-70"
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      >
        {loading ? 'Saving...' : initial ? 'Update Expense' : 'Add Expense'}
      </motion.button>
    </form>
  );
};

// Expense Card
const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const color = CATEGORY_COLORS[expense.category] || '#6b7280';

  return (
    <motion.div
      className="card-glass p-5 relative group overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30 }}
      whileHover={{ y: -3, boxShadow: '0 16px 40px rgba(239,68,68,0.1)' }}
      layout
    >
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ background: color }} />
      <div className="pl-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-lg font-bold" style={{ background: color }}>
              {expense.category?.[0] || '?'}
            </div>
            <div>
              <p className="font-bold text-foreground">{expense.category}</p>
              {expense.description && <p className="text-xs text-muted-foreground mt-0.5">{expense.description}</p>}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-black text-destructive">-₹{Number(expense.amount).toLocaleString('en-IN')}</p>
            <div className="flex items-center gap-1 justify-end mt-1 text-xs text-muted-foreground">
              <RiCalendarLine />
              <span>{formatDate(expense.date)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            onClick={() => onEdit(expense)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          >
            <RiEditLine /> Edit
          </motion.button>
          <motion.button
            onClick={() => onDelete(expense.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          >
            <RiDeleteBinLine /> Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const ExpensePage = () => {
  const { user } = useAuth();
  const { addToast } = useToastNotify();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('All');

  const fetchExpenses = useCallback(async () => {
    if (!user) return;
    const { data, error } = await expenseService.getAll(user.id);
    if (!error) setExpenses(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleSubmit = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        const { error } = await expenseService.update(editing.id, { ...form, amount: Number(form.amount) });
        if (error) { addToast(error.message, 'error'); return; }
        addToast('Expense updated! ✅', 'success');
      } else {
        const { error } = await expenseService.create({ ...form, amount: Number(form.amount), user_id: user.id });
        if (error) { addToast(error.message, 'error'); return; }
        addToast('Expense added! 📊', 'success');
      }
      setModalOpen(false);
      setEditing(null);
      fetchExpenses();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await expenseService.delete(id);
    if (!error) { addToast('Expense deleted', 'info'); fetchExpenses(); }
    else addToast(error.message, 'error');
  };

  const categories = ['All', ...new Set(expenses.map(e => e.category))];
  const filtered = filterCat === 'All' ? expenses : expenses.filter(e => e.category === filterCat);
  const total = filtered.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="pt-24 pb-24 px-4 max-w-4xl mx-auto">
      <ScrollReveal>
        <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg gradient-expense flex items-center justify-center">
                <RiShoppingBagLine className="text-white text-xs" />
              </div>
              <span className="text-xs font-semibold text-destructive uppercase tracking-widest">Expenses</span>
            </div>
            <h1 className="text-4xl font-black text-foreground">Your Expenses</h1>
            <p className="text-muted-foreground mt-1">Track where your money goes</p>
          </div>
          <motion.div className="card-glass px-6 py-3 text-right" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <p className="text-xs text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-black text-destructive">₹{total.toLocaleString('en-IN')}</p>
          </motion.div>
        </div>
      </ScrollReveal>

      {/* Category filter chips */}
      {expenses.length > 0 && (
        <ScrollReveal delay={0.1}>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-1 px-1">
            {categories.map(cat => (
              <motion.button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  filterCat === cat ? 'gradient-primary text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </ScrollReveal>
      )}

      {loading ? (
        <div className="grid gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <ScrollReveal>
          <div className="text-center py-20">
            <motion.div
              className="w-20 h-20 rounded-3xl gradient-expense mx-auto mb-4 flex items-center justify-center shadow-lg"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <RiShoppingBagLine className="text-white text-3xl" />
            </motion.div>
            <h3 className="text-xl font-bold text-foreground mb-2">No expenses found</h3>
            <p className="text-muted-foreground text-sm">Click + to add your first expense</p>
          </div>
        </ScrollReveal>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid gap-4">
            {filtered.map((expense, i) => (
              <ScrollReveal key={expense.id} delay={i * 0.05}>
                <ExpenseCard expense={expense} onEdit={(e) => { setEditing(e); setModalOpen(true); }} onDelete={handleDelete} />
              </ScrollReveal>
            ))}
          </div>
        </AnimatePresence>
      )}

      <motion.button
        className="fab"
        onClick={() => { setEditing(null); setModalOpen(true); }}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
      >
        <RiAddLine />
      </motion.button>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Expense' : 'Add Expense'}>
        <ExpenseForm initial={editing} onSubmit={handleSubmit} loading={saving} />
      </Modal>
    </div>
  );
};

export default ExpensePage;
