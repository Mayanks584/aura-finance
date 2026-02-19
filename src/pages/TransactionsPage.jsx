import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToastNotify } from '../context/ToastContext';
import { incomeService, expenseService, formatDate } from '../services/financeService';
import { ScrollReveal } from '../components/AnimatedBackground';
import { RiExchangeLine, RiArrowUpLine, RiArrowDownLine, RiSearchLine } from 'react-icons/ri';

const TransactionsPage = () => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [inc, exp] = await Promise.all([
      incomeService.getAll(user.id),
      expenseService.getAll(user.id),
    ]);
    if (!inc.error) setIncomes(inc.data || []);
    if (!exp.error) setExpenses(exp.data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const all = [
    ...incomes.map(i => ({ ...i, _type: 'income', _label: i.source })),
    ...expenses.map(e => ({ ...e, _type: 'expense', _label: e.category })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = all.filter(t => {
    const matchFilter = filter === 'All' || t._type === filter.toLowerCase();
    const matchSearch = !search || t._label?.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalIn = incomes.reduce((s, i) => s + Number(i.amount), 0);
  const totalOut = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
      <ScrollReveal>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <RiExchangeLine className="text-primary text-xl" />
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">History</span>
          </div>
          <h1 className="text-4xl font-black text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1">All your financial activity in one place</p>
        </div>
      </ScrollReveal>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total In', value: totalIn, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Total Out', value: totalOut, color: 'text-destructive', bg: 'bg-destructive/10' },
          { label: 'Net', value: totalIn - totalOut, color: totalIn >= totalOut ? 'text-success' : 'text-destructive', bg: 'bg-primary/10' },
        ].map(({ label, value, color, bg }) => (
          <ScrollReveal key={label}>
            <motion.div className={`card-glass p-4 text-center ${bg}`} whileHover={{ y: -2 }}>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className={`text-lg font-black ${color}`}>₹{Math.abs(value).toLocaleString('en-IN')}</p>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>

      {/* Filters */}
      <ScrollReveal delay={0.1}>
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
            />
          </div>
          {['All', 'Income', 'Expense'].map(f => (
            <motion.button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${filter === f ? 'gradient-primary text-white shadow-md' : 'bg-muted text-muted-foreground'}`}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              {f}
            </motion.button>
          ))}
        </div>
      </ScrollReveal>

      {/* Transaction List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-muted rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <RiExchangeLine className="text-5xl mx-auto mb-3 opacity-20" />
          <p className="font-medium">No transactions found</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {filtered.map((t, i) => (
              <motion.div
                key={`${t._type}-${t.id}`}
                className="card-glass p-4 flex items-center gap-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ x: 4, boxShadow: '0 8px 30px rgba(30,58,138,0.1)' }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${t._type === 'income' ? 'gradient-income' : 'gradient-expense'}`}>
                  {t._type === 'income' ? <RiArrowUpLine className="text-lg" /> : <RiArrowDownLine className="text-lg" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{t._label}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(t.date)}{t.description ? ` · ${t.description}` : ''}</p>
                </div>
                <span className={`text-base font-black flex-shrink-0 ${t._type === 'income' ? 'text-success' : 'text-destructive'}`}>
                  {t._type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
                </span>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default TransactionsPage;
