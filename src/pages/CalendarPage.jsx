import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    parseISO
} from 'date-fns';
import {
    RiCalendarEventLine,
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiCloseLine,
    RiArrowUpLine,
    RiArrowDownLine
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { incomeService, expenseService, formatDate } from '../services/financeService';
import { ScrollReveal } from '../components/AnimatedBackground';

const CalendarPage = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Fetch all transactions
    const fetchTransactions = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [incRes, expRes] = await Promise.all([
                incomeService.getAll(user.id),
                expenseService.getAll(user.id),
            ]);

            const all = [
                ...(incRes.data || []).map(i => ({ ...i, type: 'income', label: i.source })),
                ...(expRes.data || []).map(e => ({ ...e, type: 'expense', label: e.category })),
            ];
            setTransactions(all);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Group transactions by date string (YYYY-MM-DD)
    const transactionsByDate = useMemo(() => {
        return transactions.reduce((acc, current) => {
            // Handle the case where the date string might have time data or just be YYYY-MM-DD
            const dateKey = current.date.split('T')[0];
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(current);
            return acc;
        }, {});
    }, [transactions]);

    // Calendar Controls
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const onDateClick = (day) => {
        setSelectedDate(day);
        setShowModal(true);
    };

    // Render Calendar Header (Month/Year & Controls)
    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={prevMonth}
                        className="p-2 rounded-xl bg-white/50 hover:bg-white text-foreground shadow-sm transition-colors"
                    >
                        <RiArrowLeftSLine className="text-xl" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextMonth}
                        className="p-2 rounded-xl bg-white/50 hover:bg-white text-foreground shadow-sm transition-colors"
                    >
                        <RiArrowRightSLine className="text-xl" />
                    </motion.button>
                </div>
                <h2 className="text-2xl font-black text-foreground text-center flex-1">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground font-medium text-sm transition-colors"
                >
                    Today
                </motion.button>
            </div>
        );
    };

    // Render Days of the Week
    const renderDays = () => {
        const days = [];
        const startDate = startOfWeek(currentDate);

        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-center font-bold text-sm text-muted-foreground py-2 uppercase tracking-wide">
                    {format(addDays(startDate, i), 'E')}
                </div>
            );
        }
        return <div className="grid grid-cols-7 mb-2">{days}</div>;
    };

    // Render Calendar Cells
    const renderCells = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, 'd');
                const cloneDay = day;
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayTransactions = transactionsByDate[dateKey] || [];

                let dailyIncome = 0;
                let dailyExpense = 0;

                dayTransactions.forEach(t => {
                    if (t.type === 'income') dailyIncome += Number(t.amount);
                    if (t.type === 'expense') dailyExpense += Number(t.amount);
                });

                const isCurrentMonth = isSameMonth(day, monthStart);
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const hasActivity = dayTransactions.length > 0;

                days.push(
                    <motion.div
                        key={day}
                        whileHover={{ scale: isCurrentMonth ? 1.02 : 1 }}
                        whileTap={{ scale: isCurrentMonth ? 0.98 : 1 }}
                        onClick={() => onDateClick(cloneDay)}
                        className={`
              min-h-[100px] p-2 flex flex-col justify-between border border-border/50 transition-all cursor-pointer relative overflow-hidden
              ${!isCurrentMonth ? 'text-muted-foreground/40 bg-muted/20 pointer-events-none' : 'text-foreground bg-white/40 hover:bg-white'}
              ${isSelected ? 'ring-2 ring-primary ring-inset bg-white' : ''}
              ${i === 0 ? 'rounded-l-xl' : ''}
              ${i === 6 ? 'rounded-r-xl' : ''}
            `}
                    >
                        {/* Day Number */}
                        <div className={`flex justify-between items-start ${isToday ? 'font-black text-primary' : 'font-semibold'}`}>
                            <span className={`w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary/20 text-primary' : ''}`}>
                                {formattedDate}
                            </span>
                            {hasActivity && <span className="text-[10px] font-bold text-muted-foreground px-1 bg-muted rounded-md">{dayTransactions.length}</span>}
                        </div>

                        {/* Daily Summaries */}
                        {isCurrentMonth && (
                            <div className="mt-2 space-y-1">
                                {dailyIncome > 0 && (
                                    <div className="text-[10px] font-bold text-success flex justify-end truncate">
                                        +₹{dailyIncome.toLocaleString('en-IN')}
                                    </div>
                                )}
                                {dailyExpense > 0 && (
                                    <div className="text-[10px] font-bold text-destructive flex justify-end truncate">
                                        -₹{dailyExpense.toLocaleString('en-IN')}
                                    </div>
                                )}

                                {/* Visual Indicators for dense views */}
                                {(dailyIncome > 0 || dailyExpense > 0) && (
                                    <div className="flex gap-1 mt-1 justify-end absolute bottom-2 right-2 sm:hidden">
                                        {dailyIncome > 0 && <div className="w-1.5 h-1.5 rounded-full bg-success"></div>}
                                        {dailyExpense > 0 && <div className="w-1.5 h-1.5 rounded-full bg-destructive"></div>}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 mb-1" key={day}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="calendar-grid">{rows}</div>;
    };

    // Compute transactions for selected detailed view
    const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
    const selectedTransactions = transactionsByDate[selectedDateKey] || [];

    const dailyTotalIn = selectedTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const dailyTotalOut = selectedTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

    return (
        <div className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
            <ScrollReveal>
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <RiCalendarEventLine className="text-secondary text-xl" />
                        <span className="text-xs font-semibold text-secondary uppercase tracking-widest">Timeline</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground">Cash Flow Calendar</h1>
                    <p className="text-muted-foreground mt-1">Visualize when your money comes in and goes out.</p>
                </div>
            </ScrollReveal>

            {/* Main Calendar Card */}
            <ScrollReveal delay={0.1}>
                <div className="card-glass p-6">
                    {renderHeader()}
                    {renderDays()}
                    {loading ? (
                        <div className="h-[500px] flex items-center justify-center">
                            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center animate-pulse">
                                <span className="text-white text-xl">✦</span>
                            </div>
                        </div>
                    ) : (
                        renderCells()
                    )}
                </div>
            </ScrollReveal>

            {/* Daily Details Modal (or Bottom Sheet alternative) */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ type: "spring", bounce: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                            className="card-glass shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-border/50 flex items-center justify-between gradient-primary text-white">
                                <div>
                                    <h3 className="text-xl font-bold">
                                        {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'EEEE')}
                                    </h3>
                                    <p className="text-white/80 text-sm">{format(selectedDate, 'MMMM d, yyyy')}</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                                >
                                    <RiCloseLine className="text-2xl" />
                                </button>
                            </div>

                            {/* Day Summary row */}
                            <div className="grid grid-cols-2 bg-muted/30 border-b border-border/50">
                                <div className="p-4 text-center border-r border-border/50">
                                    <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase">Income</p>
                                    <p className="text-lg font-black text-success">+₹{dailyTotalIn.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="p-4 text-center">
                                    <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase">Expenses</p>
                                    <p className="text-lg font-black text-destructive">-₹{dailyTotalOut.toLocaleString('en-IN')}</p>
                                </div>
                            </div>

                            {/* Transactions List */}
                            <div className="p-6 overflow-y-auto">
                                <h4 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">
                                    Transactions ({selectedTransactions.length})
                                </h4>

                                {selectedTransactions.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p className="text-4xl mb-2 opacity-50">😴</p>
                                        <p>No transactions for this day.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedTransactions.map((t, idx) => (
                                            <motion.div
                                                key={idx}
                                                className="p-3 rounded-xl border border-border/50 bg-white/50 flex items-center gap-4"
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 \${t.type === 'income' ? 'gradient-income' : 'gradient-expense'}`}>
                                                    {t.type === 'income' ? <RiArrowUpLine className="text-lg" /> : <RiArrowDownLine className="text-lg" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-foreground text-sm truncate">{t.label}</p>
                                                    {t.description && <p className="text-xs text-muted-foreground truncate">{t.description}</p>}
                                                </div>
                                                <span className={`text-sm font-black flex-shrink-0 \${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                                                    {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default CalendarPage;
