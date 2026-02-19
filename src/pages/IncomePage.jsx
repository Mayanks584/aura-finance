import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToastNotify } from '../context/ToastContext';
import { incomeService, INCOME_SOURCES, formatDate } from '../services/financeService';
import { ScrollReveal } from '../components/AnimatedBackground';
import {
  RiAddLine, RiCloseLine, RiEditLine, RiDeleteBinLine,
  RiMoneyDollarCircleLine, RiCalendarLine,
} from 'react-icons/ri';

// Modal component
const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          className="relative w-full max-w-md card-glass p-6 z-10"
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <motion.button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
              whileTap={{ scale: 0.9 }}
            >
              <RiCloseLine />
            </motion.button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Income Form
const IncomeForm = ({ initial, onSubmit, loading }) => {
  const [form, setForm] = useState({
    amount: initial?.amount || '',
    source: initial?.source || '',
    date: initial?.date || new Date().toISOString().split('T')[0],
    description: initial?.description || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.source || !form.date) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Amount (₹)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
          <input
            type="number"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-white/60 text-foreground text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
            placeholder="0"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Source</label>
        <motion.select
          value={form.source}
          onChange={e => setForm({ ...form, source: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white/60 text-foreground text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
          required
          whileFocus={{ scale: 1.01 }}
        >
          <option value="">Select source...</option>
          {INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </motion.select>
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
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl gradient-income text-white font-bold text-sm shadow-md disabled:opacity-70"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? 'Saving...' : initial ? 'Update Income' : 'Add Income'}
      </motion.button>
    </form>
  );
};

// Income Card
const IncomeCard = ({ income, onEdit, onDelete }) => (
  <motion.div
    className="card-glass p-5 relative group overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -30 }}
    whileHover={{ y: -3, boxShadow: '0 16px 40px rgba(16,185,129,0.12)' }}
    layout
  >
    {/* Accent */}
    <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl gradient-income" />

    <div className="pl-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-income flex items-center justify-center flex-shrink-0">
            <RiMoneyDollarCircleLine className="text-white text-lg" />
          </div>
          <div>
            <p className="font-bold text-foreground">{income.source}</p>
            {income.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{income.description}</p>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-black text-success">+₹{Number(income.amount).toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1 justify-end mt-1 text-xs text-muted-foreground">
            <RiCalendarLine />
            <span>{formatDate(income.date)}</span>
          </div>
        </div>
      </div>

      {/* Action buttons — visible on hover */}
      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.button
          onClick={() => onEdit(income)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RiEditLine /> Edit
        </motion.button>
        <motion.button
          onClick={() => onDelete(income.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RiDeleteBinLine /> Delete
        </motion.button>
      </div>
    </div>
  </motion.div>
);

const IncomePage = () => {
  const { user } = useAuth();
  const { addToast } = useToastNotify();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchIncomes = useCallback(async () => {
    if (!user) return;
    const { data, error } = await incomeService.getAll(user.id);
    if (!error) setIncomes(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchIncomes(); }, [fetchIncomes]);

  const handleSubmit = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        const { error } = await incomeService.update(editing.id, { ...form, amount: Number(form.amount) });
        if (error) { addToast(error.message, 'error'); return; }
        addToast('Income updated! ✅', 'success');
      } else {
        const { error } = await incomeService.create({ ...form, amount: Number(form.amount), user_id: user.id });
        if (error) { addToast(error.message, 'error'); return; }
        addToast('Income added! 💰', 'success');
      }
      setModalOpen(false);
      setEditing(null);
      fetchIncomes();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await incomeService.delete(id);
    if (!error) { addToast('Income deleted', 'info'); fetchIncomes(); }
    else addToast(error.message, 'error');
  };

  const handleEdit = (income) => {
    setEditing(income);
    setModalOpen(true);
  };

  const total = incomes.reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="pt-24 pb-24 px-4 max-w-4xl mx-auto">
      {/* Header */}
      <ScrollReveal>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg gradient-income flex items-center justify-center">
                <RiMoneyDollarCircleLine className="text-white text-xs" />
              </div>
              <span className="text-xs font-semibold text-success uppercase tracking-widest">Income</span>
            </div>
            <h1 className="text-4xl font-black text-foreground">Your Income</h1>
            <p className="text-muted-foreground mt-1">All your income sources in one place</p>
          </div>
          {/* Total badge */}
          <motion.div
            className="card-glass px-6 py-3 text-right"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs text-muted-foreground">Total Income</p>
            <p className="text-2xl font-black text-success">₹{total.toLocaleString('en-IN')}</p>
          </motion.div>
        </div>
      </ScrollReveal>

      {/* Income List */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : incomes.length === 0 ? (
        <ScrollReveal>
          <div className="text-center py-20">
            <motion.div
              className="w-20 h-20 rounded-3xl gradient-income mx-auto mb-4 flex items-center justify-center shadow-lg"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <RiMoneyDollarCircleLine className="text-white text-3xl" />
            </motion.div>
            <h3 className="text-xl font-bold text-foreground mb-2">No income recorded yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Click the + button to add your first income</p>
          </div>
        </ScrollReveal>
      ) : (
        <AnimatePresence>
          <div className="grid gap-4">
            {incomes.map((income, i) => (
              <ScrollReveal key={income.id} delay={i * 0.05}>
                <IncomeCard income={income} onEdit={handleEdit} onDelete={handleDelete} />
              </ScrollReveal>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* FAB */}
      <motion.button
        className="fab"
        onClick={() => { setEditing(null); setModalOpen(true); }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
      >
        <RiAddLine />
      </motion.button>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? 'Edit Income' : 'Add Income'}
      >
        <IncomeForm initial={editing} onSubmit={handleSubmit} loading={saving} />
      </Modal>
    </div>
  );
};

export default IncomePage;
