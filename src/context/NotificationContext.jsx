import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/financeService';
import { useToastNotify } from './ToastContext';
import { supabase } from '../lib/supabase';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user, profile } = useAuth();
    const { addToast } = useToastNotify();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Track which budget-exceeded alerts have already been fired this session
    // so we don't spam on every re-render. Key: "overall" | "category:<name>"
    const firedAlerts = useRef(new Set());

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        const { data } = await notificationService.getUnread(user.id);
        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter((n) => !n.is_read).length);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const addNotification = useCallback(
        async (type, message) => {
            if (!user) return;
            const { data } = await notificationService.create(user.id, type, message);
            if (data) {
                setNotifications((prev) => [data, ...prev]);
                setUnreadCount((c) => c + 1);
            }
        },
        [user]
    );

    const markAllRead = useCallback(async () => {
        if (!user) return;
        await notificationService.markAllRead(user.id);
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
    }, [user]);

    /**
     * Call this whenever expenses or budget changes.
     * Fires an in-app toast + persists to DB for any newly exceeded limits.
     */
    const checkBudgetAlert = useCallback(
        async (totalSpent, monthlyLimit, categorySpending = {}, categoryLimits = {}) => {
            if (!user) return;

            const sendEmailAlert = async (msg) => {
                if (profile?.email_notifications && user?.email) {
                    try {
                        await supabase.functions.invoke('send-budget-alert', {
                            body: {
                                email: user.email,
                                displayName: profile?.display_name || user.email.split('@')[0],
                                message: msg,
                            },
                        });
                    } catch (e) {
                        console.warn('Email alert failed:', e);
                    }
                }
            };

            // ── Overall monthly budget ──
            if (monthlyLimit > 0 && totalSpent > monthlyLimit) {
                const key = 'overall';
                if (!firedAlerts.current.has(key)) {
                    firedAlerts.current.add(key);
                    const msg = `⚠️ Monthly budget exceeded! Spent ₹${totalSpent.toLocaleString('en-IN')} of ₹${monthlyLimit.toLocaleString('en-IN')} limit.`;
                    addToast(msg, 'error');
                    await addNotification('budget_alert', msg);
                    await sendEmailAlert(msg);
                }
            } else {
                firedAlerts.current.delete('overall');
            }

            // ── Per-category limits ──
            for (const [cat, limit] of Object.entries(categoryLimits)) {
                const limitNum = Number(limit);
                if (!limitNum) continue;
                const spent = categorySpending[cat] || 0;
                const key = `category:${cat}`;

                if (spent > limitNum) {
                    if (!firedAlerts.current.has(key)) {
                        firedAlerts.current.add(key);
                        const msg = `⚠️ "${cat}" budget exceeded! Spent ₹${spent.toLocaleString('en-IN')} of ₹${limitNum.toLocaleString('en-IN')} limit.`;
                        addToast(msg, 'error');
                        await addNotification('budget_alert', msg);
                        await sendEmailAlert(msg);
                    }
                } else {
                    firedAlerts.current.delete(key);
                }
            }
        },
        [user, profile, addToast, addNotification]
    );

    return (
        <NotificationContext.Provider
            value={{ notifications, unreadCount, addNotification, markAllRead, checkBudgetAlert, refetch: fetchNotifications }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
    return ctx;
};

export default NotificationContext;
