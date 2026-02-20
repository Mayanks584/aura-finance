import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToastNotify } from '../context/ToastContext';
import { incomeService, expenseService, budgetService, formatCurrency, getCurrentMonth } from '../services/financeService';
import { ScrollReveal } from '../components/AnimatedBackground';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  RiArrowUpLine, RiArrowDownLine, RiWalletLine, RiTrophyLine,
  RiSparklingLine, RiTimeLine, RiPieChartLine,
} from 'react-icons/ri';

// Animated counter hook
const useCounter = (target, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

// Metric Card Component
const MetricCard = ({ label, value, icon: Icon, gradient, change, delay = 0 }) => {
  const animated = useCounter(value);
  return (
    <ScrollReveal delay={delay}>
      <motion.div
        className="card-glass p-6 relative overflow-hidden group"
        whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(30,58,138,0.15)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Gradient accent */}
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8 ${gradient}`} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gradient} shadow-md`}>
              <Icon className="text-white text-lg" />
            </div>
            {change !== undefined && (
              <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${change >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                }`}>
                {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-xs font-medium mb-1">{label}</p>
          <p className="text-2xl font-black text-foreground">
            ₹{animated.toLocaleString('en-IN')}
          </p>
        </div>
      </motion.div>
    </ScrollReveal>
  );
};

// Health Score ring
const HealthScore = ({ score }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={radius} fill="none" stroke="hsl(214,32%,91%)" strokeWidth="10" />
          <motion.circle
            cx="65" cy="65" r={radius} fill="none"
            stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-black"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground font-medium">Score</span>
        </div>
      </div>
      <p className="text-sm font-semibold mt-2" style={{ color }}>
        {score >= 70 ? '🌟 Excellent' : score >= 40 ? '⚡ Good' : '⚠️ Needs Work'}
      </p>
    </div>
  );
};

// Recent transaction item
const TransactionItem = ({ item, type }) => (
  <motion.div
    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all group"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ x: 4 }}
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0 ${type === 'income' ? 'gradient-income' : 'gradient-expense'
      }`}>
      {type === 'income' ? '↑' : '↓'}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground truncate">
        {item.source || item.category}
      </p>
      <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
    </div>
    <span className={`text-sm font-bold ${type === 'income' ? 'text-success' : 'text-destructive'}`}>
      {type === 'income' ? '+' : '-'}₹{Number(item.amount).toLocaleString('en-IN')}
    </span>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToastNotify();
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [inc, exp, bud] = await Promise.all([
        incomeService.getAll(user.id),
        expenseService.getAll(user.id),
        budgetService.getByMonth(user.id, getCurrentMonth()),
      ]);
      if (!inc.error) setIncomes(inc.data || []);
      if (!exp.error) setExpenses(exp.data || []);
      if (!bud.error) setBudget(bud.data);

      // Build monthly chart data
      const months = {};
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        months[key] = { month: monthNames[d.getMonth()], income: 0, expense: 0 };
      }
      (inc.data || []).forEach(r => {
        const key = r.date?.slice(0, 7);
        if (months[key]) months[key].income += Number(r.amount);
      });
      (exp.data || []).forEach(r => {
        const key = r.date?.slice(0, 7);
        if (months[key]) months[key].expense += Number(r.amount);
      });
      setChartData(Object.values(months));
    } catch (err) {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalIncome = incomes.reduce((s, i) => s + Number(i.amount), 0);
  const totalExpense = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0;
  const healthScore = Math.min(100, Math.max(0, Math.round(savingsRate * 1.5 + (netBalance > 0 ? 25 : 0))));

  const pieData = [
    { name: 'Income', value: totalIncome, color: '#10b981' },
    { name: 'Expense', value: totalExpense, color: '#ef4444' },
  ];

  const recentAll = [
    ...incomes.slice(0, 3).map(i => ({ ...i, _type: 'income' })),
    ...expenses.slice(0, 3).map(e => ({ ...e, _type: 'expense' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  const budgetUsed = budget?.monthly_limit
    ? Math.round((totalExpense / budget.monthly_limit) * 100)
    : null;

  return (
    <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <ScrollReveal>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <RiSparklingLine className="text-primary text-xl" />
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Dashboard</span>
          </div>
          <h1 className="text-4xl font-black text-foreground">
            Good morning<span className="text-gradient"> 👋</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your financial overview for {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </ScrollReveal>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Income" value={totalIncome} icon={RiArrowUpLine} gradient="gradient-income" change={8} delay={0} />
        <MetricCard label="Total Expense" value={totalExpense} icon={RiArrowDownLine} gradient="gradient-expense" change={-3} delay={0.1} />
        <MetricCard label="Net Balance" value={Math.abs(netBalance)} icon={RiWalletLine} gradient="gradient-savings" delay={0.2} />
        <ScrollReveal delay={0.3}>
          <motion.div
            className="card-glass p-6 relative overflow-hidden"
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <RiTrophyLine className="text-warning" />
              <p className="text-xs font-medium text-muted-foreground">Savings Rate</p>
            </div>
            <p className="text-3xl font-black text-foreground mb-2">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {savingsRate}%
              </motion.span>
            </p>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, savingsRate)}%` }}
                transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        </ScrollReveal>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Chart — spans 2 cols */}
        <ScrollReveal delay={0.1} className="lg:col-span-2">
          <motion.div className="card-glass p-6 lg:col-span-2" whileHover={{ y: -2 }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-foreground">3-Month Trend</h3>
              <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">Income vs Expense</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,94%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(215,16%,55%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215,16%,55%)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '12px', boxShadow: '0 8px 32px rgba(30,58,138,0.12)', fontSize: '12px' }}
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#incomeGrad)" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} fill="url(#expenseGrad)" name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </ScrollReveal>

        {/* Health Score */}
        <ScrollReveal delay={0.2}>
          <motion.div className="card-glass p-6 flex flex-col items-center justify-center gap-4" whileHover={{ y: -2 }}>
            <h3 className="font-bold text-foreground self-start">Financial Health</h3>
            <HealthScore score={healthScore} />
            <div className="w-full space-y-2">
              {[
                { label: 'Income Diversity', val: Math.min(100, (new Set(incomes.map(i => i.source)).size) * 25) },
                { label: 'Budget Control', val: budgetUsed != null ? Math.max(0, 100 - budgetUsed) : 50 },
                { label: 'Savings Rate', val: Math.min(100, savingsRate * 2) },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold text-foreground">{val}%</span>
                  </div>
                  <div className="progress-bar h-1.5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'var(--gradient-primary)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </ScrollReveal>
      </div>

      {/* Third row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <ScrollReveal delay={0.1} className="lg:col-span-2">
          <motion.div className="card-glass p-6" whileHover={{ y: -2 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <RiTimeLine className="text-primary" /> Recent Activity
              </h3>
              <span className="text-xs text-primary font-semibold cursor-pointer hover:underline">View all →</span>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentAll.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <RiWalletLine className="text-4xl mx-auto mb-2 opacity-30" />
                <p className="text-sm">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentAll.map(item => (
                  <TransactionItem key={`${item._type}-${item.id}`} item={item} type={item._type} />
                ))}
              </div>
            )}
          </motion.div>
        </ScrollReveal>

        {/* Pie breakdown */}
        <ScrollReveal delay={0.2}>
          <motion.div className="card-glass p-6 flex flex-col" whileHover={{ y: -2 }}>
            <h3 className="font-bold text-foreground mb-4">Breakdown</h3>
            {totalIncome + totalExpense > 0 ? (
              <>
                <div className="flex-1 flex items-center justify-center">
                  <PieChart width={160} height={160}>
                    <Pie data={pieData} cx={80} cy={80} innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={4}>
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
                <div className="space-y-2 mt-2">
                  {pieData.map(item => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-semibold">₹{item.value.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                    <RiPieChartLine className="text-3xl opacity-30" />
                  </div>
                  <p className="text-xs">Add transactions to see breakdown</p>
                </div>
              </div>
            )}
          </motion.div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Dashboard;
