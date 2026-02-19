import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToastNotify } from '../context/ToastContext';
import {
  expenseService, budgetService, EXPENSE_CATEGORIES,
  formatCurrency, getCurrentMonth,
} from '../services/financeService';
import { ScrollReveal } from '../components/AnimatedBackground';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';
import { RiPieChartLine, RiEditLine, RiCheckLine } from 'react-icons/ri';

// Circular budget meter
const BudgetMeter = ({ used, limit, isExceeded }) => {
  const percentage = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const strokeColor = isExceeded ? '#ef4444' : percentage >= 75 ? '#f59e0b' : '#10b981';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-52 h-52">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background track */}
          <circle cx="100" cy="100" r={radius} fill="none" stroke="hsl(214,32%,91%)" strokeWidth="14" />
          {/* Progress */}
          <motion.circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
          {/* Glow effect if exceeded */}
          {isExceeded && (
            <motion.circle
              cx="100" cy="100" r={radius}
              fill="none"
              stroke="#ef4444"
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-black"
            style={{ color: strokeColor }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            {percentage}%
          </motion.span>
          <span className="text-xs text-muted-foreground font-medium">Budget Used</span>
          {isExceeded && (
            <motion.span
              className="text-xs font-bold text-destructive mt-1"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ⚠️ EXCEEDED
            </motion.span>
          )}
        </div>
      </div>
      <div className="flex gap-6 mt-4 text-center">
        <div>
          <p className="text-xs text-muted-foreground">Spent</p>
          <p className="font-bold text-destructive">₹{used.toLocaleString('en-IN')}</p>
        </div>
        <div className="w-px bg-border" />
        <div>
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className={`font-bold ${isExceeded ? 'text-destructive' : 'text-success'}`}>
            ₹{Math.abs(limit - used).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="w-px bg-border" />
        <div>
          <p className="text-xs text-muted-foreground">Limit</p>
          <p className="font-bold text-foreground">₹{limit.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  );
};

// Category progress bar
const CategoryBar = ({ category, spent, limit, color }) => {
  const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
  const exceeded = spent > limit;

  return (
    <motion.div
      className={`p-4 rounded-xl border transition-all ${exceeded ? 'border-destructive/30 bg-destructive/5 animate-pulse-glow' : 'border-border bg-white/50'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: color }} />
          <span className="text-sm font-medium text-foreground">{category}</span>
        </div>
        <div className="text-right">
          <span className={`text-sm font-bold ${exceeded ? 'text-destructive' : 'text-foreground'}`}>
            ₹{spent.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-muted-foreground"> / ₹{limit.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div className="progress-bar h-1.5">
        <motion.div
          className="h-full rounded-full"
          style={{ background: exceeded ? '#ef4444' : color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

const CATEGORY_COLORS = {
  'Food & Dining': '#f59e0b', 'Transportation': '#3b82f6', 'Housing & Rent': '#8b5cf6',
  'Entertainment': '#ec4899', 'Shopping': '#06b6d4', 'Healthcare': '#10b981',
  'Education': '#6366f1', 'Utilities': '#f97316', 'Travel': '#14b8a6',
  'Personal Care': '#a855f7', 'Savings': '#22c55e', 'Other': '#6b7280',
};

const BudgetPage = () => {
  const { user } = useAuth();
  const { addToast } = useToastNotify();
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingLimit, setEditingLimit] = useState(false);
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [categoryLimits, setCategoryLimits] = useState({});
  const [saving, setSaving] = useState(false);

  const currentMonth = getCurrentMonth();

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [exp, bud] = await Promise.all([
      expenseService.getAll(user.id),
      budgetService.getByMonth(user.id, currentMonth),
    ]);
    if (!exp.error) setExpenses(exp.data || []);
    if (!bud.error && bud.data) {
      setBudget(bud.data);
      setMonthlyLimit(bud.data.monthly_limit || '');
      setCategoryLimits(bud.data.category_limit || {});
    }
    setLoading(false);
  }, [user, currentMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const limit = Number(budget?.monthly_limit || 0);
  const isExceeded = limit > 0 && totalSpent > limit;

  // Category spending
  const categorySpending = EXPENSE_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = expenses.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0);
    return acc;
  }, {});

  const handleSaveBudget = async () => {
    setSaving(true);
    const { error } = await budgetService.upsert({
      user_id: user.id,
      month: currentMonth,
      monthly_limit: Number(monthlyLimit),
      category_limit: categoryLimits,
    });
    if (error) addToast(error.message, 'error');
    else { addToast('Budget saved! 🎯', 'success'); fetchData(); setEditingLimit(false); }
    setSaving(false);
  };

  const barData = EXPENSE_CATEGORIES
    .filter(c => categorySpending[c] > 0 || categoryLimits[c])
    .map(c => ({
      name: c.split(' ')[0],
      spent: categorySpending[c] || 0,
      limit: Number(categoryLimits[c] || 0),
      color: CATEGORY_COLORS[c],
    }));

  return (
    <div className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
      <ScrollReveal>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg gradient-savings flex items-center justify-center">
              <RiPieChartLine className="text-white text-xs" />
            </div>
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Budget</span>
          </div>
          <h1 className="text-4xl font-black text-foreground">Monthly Budget</h1>
          <p className="text-muted-foreground mt-1">Set and track your spending limits for {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Meter Card */}
        <ScrollReveal>
          <motion.div className="card-glass p-8 flex flex-col items-center" whileHover={{ y: -2 }}>
            <h3 className="font-bold text-foreground self-start mb-6">Overall Budget</h3>
            {loading ? (
              <div className="w-52 h-52 rounded-full bg-muted animate-pulse" />
            ) : limit === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-4">Set a monthly budget limit to start tracking</p>
                <motion.button
                  onClick={() => setEditingLimit(true)}
                  className="px-6 py-3 rounded-xl gradient-primary text-white font-semibold text-sm"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                  Set Budget Limit
                </motion.button>
              </div>
            ) : (
              <BudgetMeter used={totalSpent} limit={limit} isExceeded={isExceeded} />
            )}

            {/* Edit budget limit */}
            {editingLimit ? (
              <motion.div
                className="w-full mt-6 space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <label className="block text-xs font-semibold text-muted-foreground">Monthly Limit (₹)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={monthlyLimit}
                    onChange={e => setMonthlyLimit(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-white/60 text-foreground text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    placeholder="e.g. 50000"
                  />
                  <motion.button
                    onClick={handleSaveBudget}
                    disabled={saving}
                    className="px-4 py-3 rounded-xl gradient-primary text-white text-sm font-semibold"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  >
                    {saving ? '...' : <RiCheckLine className="text-lg" />}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                onClick={() => setEditingLimit(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-medium hover:bg-primary/10 hover:text-primary transition-all"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                <RiEditLine /> Edit Limit
              </motion.button>
            )}
          </motion.div>
        </ScrollReveal>

        {/* Category spending bar chart */}
        <ScrollReveal delay={0.1}>
          <motion.div className="card-glass p-6" whileHover={{ y: -2 }}>
            <h3 className="font-bold text-foreground mb-4">Spending by Category</h3>
            {barData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No expenses this month</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,94%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(215,16%,55%)' }} angle={-40} textAnchor="end" axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(215,16%,55%)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '12px', fontSize: '11px' }}
                    formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, '']}
                  />
                  <Bar dataKey="spent" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </ScrollReveal>
      </div>

      {/* Category Limits */}
      <ScrollReveal delay={0.2}>
        <motion.div className="card-glass p-6" whileHover={{ y: -2 }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Category Limits</h3>
            <motion.button
              onClick={handleSaveBudget}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-xs font-semibold shadow-md"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >
              {saving ? 'Saving...' : <><RiCheckLine /> Save All</>}
            </motion.button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXPENSE_CATEGORIES.map(cat => (
              <div key={cat} className="space-y-2">
                {categoryLimits[cat] ? (
                  <CategoryBar
                    category={cat}
                    spent={categorySpending[cat] || 0}
                    limit={Number(categoryLimits[cat])}
                    color={CATEGORY_COLORS[cat]}
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border hover:border-primary/50 transition-all group">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[cat] }} />
                    <span className="text-xs text-muted-foreground flex-1">{cat}</span>
                    <input
                      type="number"
                      placeholder="Set limit"
                      value={categoryLimits[cat] || ''}
                      onChange={e => setCategoryLimits(prev => ({ ...prev, [cat]: e.target.value }))}
                      className="w-24 px-2 py-1 rounded-lg border border-border bg-white/60 text-xs outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </ScrollReveal>
    </div>
  );
};

export default BudgetPage;
