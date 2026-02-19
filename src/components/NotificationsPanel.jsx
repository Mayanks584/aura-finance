import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiBellLine, RiCheckDoubleLine, RiCloseLine } from 'react-icons/ri';
import { useNotifications } from '../context/NotificationContext';

const NotificationsPanel = ({ isOpen, onClose }) => {
    const { notifications, markAllRead } = useNotifications();

    const handleOpen = () => {
        if (isOpen) markAllRead();
    };

    // Mark all read when panel opens
    React.useEffect(() => {
        if (isOpen) markAllRead();
    }, [isOpen, markAllRead]);

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now - d;
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return `${diffHr}h ago`;
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        className="fixed top-20 right-4 z-50 w-80 max-h-[480px] glass rounded-2xl shadow-xl flex flex-col overflow-hidden"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <RiBellLine className="text-primary text-base" />
                                <span className="text-sm font-bold text-foreground">Notifications</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                            >
                                <RiCloseLine className="text-base" />
                            </button>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto flex-1">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <RiBellLine className="text-3xl mb-2 opacity-30" />
                                    <p className="text-xs">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {notifications.map((n) => (
                                        <motion.div
                                            key={n.id}
                                            className={`px-4 py-3 text-sm transition-colors ${!n.is_read ? 'bg-primary/5' : ''
                                                }`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <p className="text-foreground leading-snug">{n.message}</p>
                                            <p className="text-muted-foreground text-xs mt-1">{formatTime(n.created_at)}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 border-t border-border">
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <RiCheckDoubleLine />
                                    Mark all as read
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationsPanel;
