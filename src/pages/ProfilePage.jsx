import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToastNotify } from '../context/ToastContext';
import { profileService, CURRENCIES } from '../services/financeService';
import { ScrollReveal } from '../components/AnimatedBackground';
import {
    RiUserLine, RiCameraLine, RiSaveLine, RiMailLine,
    RiMoneyDollarCircleLine, RiBellLine, RiShieldCheckLine,
} from 'react-icons/ri';

const ProfilePage = () => {
    const { user, profile, updateProfile } = useAuth();
    const { addToast } = useToastNotify();
    const [displayName, setDisplayName] = useState('');
    const [currency, setCurrency] = useState('INR');
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [avatarPreview, setAvatarPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    // Prefill form from existing profile
    useEffect(() => {
        if (profile) {
            setDisplayName(profile.display_name || '');
            setCurrency(profile.currency || 'INR');
            setEmailNotifications(profile.email_notifications || false);
            setAvatarUrl(profile.avatar_url || '');
            setAvatarPreview(profile.avatar_url || '');
        }
    }, [profile]);

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            addToast('Please select an image file', 'error');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            addToast('Image must be less than 2 MB', 'error');
            return;
        }

        // Local preview immediately
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target.result);
        reader.readAsDataURL(file);

        setUploading(true);
        const { data: url, error } = await profileService.uploadAvatar(user.id, file);
        setUploading(false);

        if (error) {
            addToast('Avatar upload failed — using preview only', 'error');
        } else {
            setAvatarUrl(url);
            addToast('Avatar uploaded! ✅', 'success');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const { error } = await updateProfile({
            display_name: displayName.trim() || null,
            currency,
            email_notifications: emailNotifications,
            avatar_url: avatarUrl || null,
        });
        setSaving(false);
        if (error) addToast(error.message, 'error');
        else addToast('Profile updated! 🎉', 'success');
    };

    const initials = displayName?.charAt(0)?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

    return (
        <div className="pt-24 pb-12 px-4 max-w-2xl mx-auto">
            {/* Page header */}
            <ScrollReveal>
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
                            <RiUserLine className="text-white text-xs" />
                        </div>
                        <span className="text-xs font-semibold text-primary uppercase tracking-widest">Account</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground">Profile Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your display name, avatar, and preferences</p>
                </div>
            </ScrollReveal>

            {/* Avatar section */}
            <ScrollReveal delay={0.05}>
                <motion.div className="card-glass p-6 mb-5" whileHover={{ y: -2 }}>
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                        <RiCameraLine className="text-primary" /> Profile Photo
                    </h3>
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar"
                                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-primary/30"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-black ring-2 ring-primary/20">
                                    {initials}
                                </div>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                            />
                            <motion.button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold shadow-md disabled:opacity-50"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                            >
                                {uploading ? 'Uploading...' : 'Upload Photo'}
                            </motion.button>
                            <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF · max 2 MB</p>
                        </div>
                    </div>
                </motion.div>
            </ScrollReveal>

            {/* Display Name */}
            <ScrollReveal delay={0.1}>
                <motion.div className="card-glass p-6 mb-5" whileHover={{ y: -2 }}>
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                        <RiUserLine className="text-primary" /> Display Name
                    </h3>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Name shown in the app</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder={user?.email?.split('@')[0] || 'Your name'}
                            maxLength={50}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-white/60 text-foreground text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                        />
                    </div>
                    <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                        <RiMailLine className="text-muted-foreground text-sm flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                        <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Email</span>
                    </div>
                </motion.div>
            </ScrollReveal>

            {/* Currency Preference */}
            <ScrollReveal delay={0.15}>
                <motion.div className="card-glass p-6 mb-5" whileHover={{ y: -2 }}>
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                        <RiMoneyDollarCircleLine className="text-primary" /> Currency Preference
                    </h3>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Display amounts in</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {CURRENCIES.map((cur) => (
                                <motion.button
                                    key={cur.code}
                                    onClick={() => setCurrency(cur.code)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${currency === cur.code
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border text-foreground hover:border-primary/50'
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span className="text-lg leading-none">{cur.symbol}</span>
                                    <div className="text-left">
                                        <p className="text-xs font-bold">{cur.code}</p>
                                        <p className="text-[10px] text-muted-foreground leading-tight">{cur.label}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </ScrollReveal>

            {/* Notifications */}
            <ScrollReveal delay={0.2}>
                <motion.div className="card-glass p-6 mb-6" whileHover={{ y: -2 }}>
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                        <RiBellLine className="text-primary" /> Notifications
                    </h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground">Email Budget Alerts</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Receive an email when a budget limit is exceeded
                            </p>
                        </div>
                        {/* Toggle switch */}
                        <button
                            onClick={() => setEmailNotifications((v) => !v)}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${emailNotifications ? 'bg-primary' : 'bg-muted'
                                }`}
                        >
                            <motion.div
                                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                                animate={{ x: emailNotifications ? 24 : 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        </button>
                    </div>
                    {emailNotifications && (
                        <motion.div
                            className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/20"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <p className="text-xs text-primary flex items-center gap-1.5">
                                <RiShieldCheckLine />
                                Budget alerts will be sent to <strong>{user?.email}</strong>
                            </p>
                        </motion.div>
                    )}
                </motion.div>
            </ScrollReveal>

            {/* Save button */}
            <ScrollReveal delay={0.25}>
                <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl gradient-primary text-white font-bold text-sm shadow-lg disabled:opacity-60"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {saving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <RiSaveLine className="text-lg" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
            </ScrollReveal>
        </div>
    );
};

export default ProfilePage;
