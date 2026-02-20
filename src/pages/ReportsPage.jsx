import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { incomeService, expenseService } from '../services/financeService';
import { ScrollReveal } from '../components/AnimatedBackground';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { RiBarChartLine, RiLineChartLine, RiPieChartLine, RiDownloadLine } from 'react-icons/ri';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1', '#a855f7', '#6b7280'];

const ReportsPage = () => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bar');

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [inc, exp] = await Promise.all([incomeService.getAll(user.id), expenseService.getAll(user.id)]);
    if (!inc.error) setIncomes(inc.data || []);
    if (!exp.error) setExpenses(exp.data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Build monthly data (3 months)
  const now = new Date();
  const monthlyData = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const income = incomes.filter(r => r.date?.startsWith(key)).reduce((s, r) => s + Number(r.amount), 0);
    const expense = expenses.filter(r => r.date?.startsWith(key)).reduce((s, r) => s + Number(r.amount), 0);
    return { month: `${MONTHS[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`, income, expense, savings: income - expense };
  });

  // Category breakdown for pie
  const catData = expenses.reduce((acc, e) => {
    const found = acc.find(a => a.name === e.category);
    if (found) found.value += Number(e.amount);
    else acc.push({ name: e.category, value: Number(e.amount) });
    return acc;
  }, []).sort((a, b) => b.value - a.value).slice(0, 8);

  const exportCSV = () => {
    const rows = [
      ['Month', 'Income', 'Expense', 'Savings'],
      ...monthlyData.map(d => [d.month, d.income, d.expense, d.savings]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'finance-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const chartTabs = [
    { key: 'bar', icon: RiBarChartLine, label: 'Bar' },
    { key: 'line', icon: RiLineChartLine, label: 'Line' },
    { key: 'pie', icon: RiPieChartLine, label: 'Donut' },
  ];

  const tooltipStyle = { background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 8px 32px rgba(30,58,138,0.12)', fontSize: '12px' };

  return (
    <div className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
      <ScrollReveal>
        <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <RiBarChartLine className="text-primary text-xl" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Analytics</span>
            </div>
            <h1 className="text-4xl font-black text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-1">Visual breakdown of your finances</p>
          </div>
          <motion.button
            onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: '0 16px 40px rgba(59,130,246,0.3)' }}
            whileTap={{ scale: 0.95 }}
          >
            <RiDownloadLine /> Export CSV
          </motion.button>
        </div>
      </ScrollReveal>

      {/* Chart toggle */}
      <ScrollReveal delay={0.1}>
        <div className="flex gap-2 mb-6 card-glass p-2 w-fit rounded-2xl">
          {chartTabs.map(({ key, icon: Icon, label }) => (
            <motion.button
              key={key}
              onClick={() => setChartType(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${chartType === key ? 'gradient-primary text-white shadow-md' : 'text-muted-foreground hover:text-foreground'
                }`}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              <Icon /> {label}
            </motion.button>
          ))}
        </div>
      </ScrollReveal>

      {/* Main Chart */}
      <ScrollReveal delay={0.15}>
        <motion.div className="card-glass p-6 mb-6" whileHover={{ y: -2 }}>
          <h3 className="font-bold text-foreground mb-6">
            {chartType === 'bar' ? '3-Month Income vs Expense' :
              chartType === 'line' ? '3-Month Financial Trend' : 'Expense Category Breakdown'}
          </h3>
          {loading ? (
            <div className="h-64 bg-muted rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              {chartType === 'bar' ? (
                <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,94%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(215,16%,55%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(215,16%,55%)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={v => [`₹${v.toLocaleString('en-IN')}`, '']} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,94%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(215,16%,55%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(215,16%,55%)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={v => [`₹${v.toLocaleString('en-IN')}`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                  <Line type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
                  <Line type="monotone" dataKey="savings" name="Savings" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#3b82f6' }} />
                </LineChart>
              ) : (
                <PieChart>
                  <Pie data={catData.length ? catData : [{ name: 'No Data', value: 1 }]} cx="50%" cy="50%" innerRadius={70} outerRadius={120} dataKey="value" paddingAngle={3}>
                    {(catData.length ? catData : [{ name: 'No Data', value: 1 }]).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={v => [`₹${v.toLocaleString('en-IN')}`, '']} />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          )}
        </motion.div>
      </ScrollReveal>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Income', value: incomes.reduce((s, i) => s + Number(i.amount), 0), color: 'text-success' },
          { label: 'Total Expenses', value: expenses.reduce((s, e) => s + Number(e.amount), 0), color: 'text-destructive' },
          { label: 'Net Savings', value: incomes.reduce((s, i) => s + Number(i.amount), 0) - expenses.reduce((s, e) => s + Number(e.amount), 0), color: 'text-primary' },
          { label: 'Transactions', value: incomes.length + expenses.length, color: 'text-foreground', isCount: true },
        ].map(({ label, value, color, isCount }, i) => (
          <ScrollReveal key={label} delay={i * 0.05}>
            <motion.div className="card-glass p-4 text-center" whileHover={{ y: -3 }}>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className={`text-xl font-black ${color}`}>
                {isCount ? value : `₹${Math.abs(value).toLocaleString('en-IN')}`}
              </p>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
