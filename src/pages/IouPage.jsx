import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToastNotify } from '../context/ToastContext';
import { iouService, formatDate } from '../services/financeService';
import { ScrollReveal } from '../components/AnimatedBackground';
import {
    RiAddLine, RiCloseLine, RiEditLine, RiDeleteBinLine,
    RiUserHeartLine, RiUserUnfollowLine, RiCheckDoubleLine,
    RiGroupLine
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

// IOU Form
const IouForm = ({ initial, onSubmit, loading, defaultType }) => {
    const [form, setForm] = useState({
        person_name: initial?.person_name || '',
        amount: initial?.amount || '',
        type: initial?.type || defaultType || 'owes_me',
        description: initial?.description || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.person_name || !form.amount || !form.type) return;
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Type</label>
                <div className="flex bg-muted/50 p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setForm({ ...form, type: 'owes_me' })}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${form.type === 'owes_me' ? 'bg-white shadow text-success' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        They Owe Me
                    </button>
                    <button
                        type="button"
                        onClick={() => setForm({ ...form, type: 'i_owe' })}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${form.type === 'i_owe' ? 'bg-white shadow text-destructive' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        I Owe Them
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Person's Name</label>
                <input
                    type="text"
                    value={form.person_name}
                    onChange={e => setForm({ ...form, person_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white/60 text-foreground text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                    placeholder="e.g. John Doe"
                    required
                />
            </div>

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
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Description / Reason</label>
                <input
                    type="text"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white/60 text-foreground text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                    placeholder="e.g. Dinner, Rent..."
                />
            </div>

            <motion.button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md disabled:opacity-70 transition-colors ${form.type === 'owes_me' ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'
                    }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {loading ? 'Saving...' : initial ? 'Update Split' : 'Save Split'}
            </motion.button>
        </form>
    );
};

// IOU Card
const IouCard = ({ iou, onEdit, onDelete, onSettle }) => {
    const isOwesMe = iou.type === 'owes_me';
    const colorClass = isOwesMe ? 'text-success' : 'text-destructive';
    const bgColorClass = isOwesMe ? 'bg-success' : 'bg-destructive';
    const badgeClass = iou.is_settled
        ? 'bg-muted text-muted-foreground border border-border'
        : isOwesMe ? 'bg-success/10 text-success border border-success/20' : 'bg-destructive/10 text-destructive border border-destructive/20';

    return (
        <motion.div
            className={`card-glass p-5 relative group overflow-hidden ${iou.is_settled ? 'opacity-60 grayscale-[0.5]' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
            layout
        >
            <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${iou.is_settled ? 'bg-muted-foreground/30' : bgColorClass}`} />

            <div className="pl-2">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-inner ${iou.is_settled ? 'bg-muted-foreground' : bgColorClass}`}>
                            {isOwesMe ? <RiUserHeartLine className="text-lg" /> : <RiUserUnfollowLine className="text-lg" />}
                        </div>
                        <div>
                            <p className="font-bold text-foreground">{iou.person_name}</p>
                            {iou.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{iou.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                        <p className={`text-xl font-black ${iou.is_settled ? 'text-muted-foreground' : colorClass}`}>
                            ₹{Number(iou.amount).toLocaleString('en-IN')}
                        </p>
                        <div className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                            {iou.is_settled ? 'Settled' : isOwesMe ? 'Owes You' : 'You Owe'}
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!iou.is_settled && (
                        <motion.button
                            onClick={() => onSettle(iou.id, true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <RiCheckDoubleLine /> Mark Settled
                        </motion.button>
                    )}
                    {iou.is_settled && (
                        <motion.button
                            onClick={() => onSettle(iou.id, false)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-semibold hover:text-foreground"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Unsettle
                        </motion.button>
                    )}
                    <motion.button
                        onClick={() => onEdit(iou)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground text-xs font-semibold transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <RiEditLine /> Edit
                    </motion.button>
                    <motion.button
                        onClick={() => onDelete(iou.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-destructive/10 text-destructive text-xs font-semibold transition-colors ml-auto"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <RiDeleteBinLine /> Delete
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

const IouPage = () => {
    const { user } = useAuth();
    const { addToast } = useToastNotify();
    const [ious, setIous] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('owes_me'); // 'owes_me' or 'i_owe'

    const fetchIous = useCallback(async () => {
        if (!user) return;
        const { data, error } = await iouService.getAll(user.id);
        if (!error) setIous(data || []);
        setLoading(false);
    }, [user]);

    useEffect(() => { fetchIous(); }, [fetchIous]);

    const handleSubmit = async (form) => {
        setSaving(true);
        try {
            if (editing) {
                const { error } = await iouService.update(editing.id, { ...form, amount: Number(form.amount) });
                if (error) { addToast(error.message, 'error'); return; }
                addToast('Split updated! ✅', 'success');
            } else {
                const { error } = await iouService.create({ ...form, amount: Number(form.amount), user_id: user.id });
                if (error) { addToast(error.message, 'error'); return; }
                addToast('Split added! 👥', 'success');
                // Switch to the tab where the item was added
                setActiveTab(form.type);
            }
            setModalOpen(false);
            setEditing(null);
            fetchIous();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const { error } = await iouService.delete(id);
        if (!error) { addToast('Deleted successfully', 'info'); fetchIous(); }
        else addToast(error.message, 'error');
    };

    const handleSettle = async (id, is_settled) => {
        const payload = { is_settled };
        if (is_settled) payload.settled_at = new Date().toISOString();

        const { error } = await iouService.update(id, payload);
        if (!error) {
            addToast(is_settled ? 'Marked as settled 🎉' : 'Unsettled', 'success');
            fetchIous();
        }
        else addToast(error.message, 'error');
    };

    const handleEdit = (iou) => {
        setEditing(iou);
        setModalOpen(true);
    };

    const filteredIous = ious.filter(i => i.type === activeTab);

    // Custom sorting: Unsettled first, then sorted by newest
    const sortedIous = [...filteredIous].sort((a, b) => {
        if (a.is_settled === b.is_settled) {
            return new Date(b.created_at) - new Date(a.created_at);
        }
        return a.is_settled ? 1 : -1;
    });

    const totalUnsettled = filteredIous
        .filter(i => !i.is_settled)
        .reduce((s, i) => s + Number(i.amount), 0);

    return (
        <div className="pt-24 pb-24 px-4 max-w-4xl mx-auto">
            {/* Header */}
            <ScrollReveal>
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                            <RiGroupLine className="text-primary text-xs" />
                        </div>
                        <span className="text-xs font-semibold text-primary uppercase tracking-widest">Splits & IOUs</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground">Bill Splitter</h1>
                    <p className="text-muted-foreground mt-1">Keep track of who owes who</p>
                </div>

                {/* Tabs & Summary Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="card-glass p-2 sm:col-span-2 flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={() => setActiveTab('owes_me')}
                            className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl transition-all ${activeTab === 'owes_me' ? 'bg-success text-white shadow-lg shadow-success/20' : 'hover:bg-muted'
                                }`}
                        >
                            <RiUserHeartLine className={`text-2xl mb-1 ${activeTab === 'owes_me' ? 'text-white' : 'text-success'}`} />
                            <span className="font-bold text-sm">They Owe Me</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('i_owe')}
                            className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl transition-all ${activeTab === 'i_owe' ? 'bg-destructive text-white shadow-lg shadow-destructive/20' : 'hover:bg-muted'
                                }`}
                        >
                            <RiUserUnfollowLine className={`text-2xl mb-1 ${activeTab === 'i_owe' ? 'text-white' : 'text-destructive'}`} />
                            <span className="font-bold text-sm">I Owe Them</span>
                        </button>
                    </div>

                    <motion.div
                        className="card-glass p-6 flex flex-col justify-center items-center text-center"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        key={`total-${activeTab}`} // Force re-animation on tab change
                    >
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-1">
                            {activeTab === 'owes_me' ? 'To Receive' : 'To Pay'} (Unsettled)
                        </p>
                        <p className={`text-3xl font-black ${activeTab === 'owes_me' ? 'text-success' : 'text-destructive'}`}>
                            ₹{totalUnsettled.toLocaleString('en-IN')}
                        </p>
                    </motion.div>
                </div>
            </ScrollReveal>

            {/* List */}
            {loading ? (
                <div className="grid xl:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)}
                </div>
            ) : sortedIous.length === 0 ? (
                <ScrollReveal>
                    <div className="text-center py-16 card-glass">
                        <motion.div
                            className={`w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg ${activeTab === 'owes_me' ? 'bg-success' : 'bg-destructive'
                                }`}
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <RiGroupLine className="text-white text-3xl" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-foreground mb-2">No records found</h3>
                        <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                            {activeTab === 'owes_me'
                                ? "Awesome! Nobody owes you money right now."
                                : "Great! You don't owe anybody money right now."}
                        </p>
                        <button
                            onClick={() => { setEditing(null); setModalOpen(true); }}
                            className="px-6 py-2.5 bg-foreground text-background font-bold text-sm rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Add New Split
                        </button>
                    </div>
                </ScrollReveal>
            ) : (
                <div className="grid xl:grid-cols-2 gap-4">
                    <AnimatePresence>
                        {sortedIous.map((iou, i) => (
                            <ScrollReveal key={iou.id} delay={i * 0.05}>
                                <IouCard
                                    iou={iou}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onSettle={handleSettle}
                                />
                            </ScrollReveal>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* FAB */}
            <motion.button
                className={`fab ${activeTab === 'owes_me' ? '!bg-success' : '!bg-destructive'}`}
                onClick={() => { setEditing(null); setModalOpen(true); }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
            >
                <RiAddLine className="text-white text-2xl" />
            </motion.button>

            {/* Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditing(null); }}
                title={editing ? 'Edit Split' : 'Add Split'}
            >
                <IouForm initial={editing} onSubmit={handleSubmit} loading={saving} defaultType={activeTab} />
            </Modal>
        </div>
    );
};

export default IouPage;
