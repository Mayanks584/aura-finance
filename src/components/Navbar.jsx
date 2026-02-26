import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationsPanel from './NotificationsPanel';
import {
  RiDashboardLine,
  RiMoneyDollarCircleLine,
  RiShoppingBagLine,
  RiPieChartLine,
  RiExchangeLine,
  RiBarChartLine,
  RiLogoutBoxLine,
  RiMenuLine,
  RiCloseLine,
  RiSparklingLine,
  RiBellLine,
  RiUserLine,
  RiGroupLine,
  RiCalendarEventLine,
} from 'react-icons/ri';

const navLinks = [
  { path: '/', label: 'Dashboard', icon: RiDashboardLine },
  { path: '/income', label: 'Income', icon: RiMoneyDollarCircleLine },
  { path: '/expenses', label: 'Expenses', icon: RiShoppingBagLine },
  { path: '/budget', label: 'Budget', icon: RiPieChartLine },
  { path: '/transactions', label: 'Transactions', icon: RiExchangeLine },
  { path: '/calendar', label: 'Calendar', icon: RiCalendarEventLine },
  { path: '/ious', label: 'Splits', icon: RiGroupLine },
  { path: '/reports', label: 'Reports', icon: RiBarChartLine },
];

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || '';
  const avatarUrl = profile?.avatar_url || null;
  const initials = displayName?.charAt(0)?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <>
      {/* Main Navbar */}
      <motion.nav
        className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl glass rounded-2xl px-6 py-3 shadow-lg"
        style={{ x: '-50%' }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-glow-primary"
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <RiSparklingLine className="text-white text-sm" />
            </motion.div>
            <span className="font-bold text-sm text-foreground hidden sm:block">
              Finance<span className="text-gradient">OS</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 px-3 border-r border-border/50 mr-1">
            {navLinks.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link key={path} to={path} className="relative" title={label}>
                  <motion.div
                    className={`nav-item flex items-center gap-2 ${isActive ? 'active' : ''}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="text-xl" />
                    <AnimatePresence mode="popLayout">
                      {isActive && (
                        <motion.span
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 'auto', opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          className="text-sm font-semibold overflow-hidden whitespace-nowrap"
                          transition={{ duration: 0.2 }}
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-xl gradient-primary opacity-10"
                        transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <motion.button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative p-2 rounded-xl hover:bg-muted transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Notifications"
            >
              <RiBellLine className="text-xl text-muted-foreground" />
              {unreadCount > 0 && (
                <motion.span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* User avatar / Profile link */}
            {user && (
              <Link to="/profile" className="hidden sm:flex items-center gap-2 group ml-1 mr-1" title={displayName || user.email}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/60 transition-all"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform">
                    {initials}
                  </div>
                )}
              </Link>
            )}

            <motion.button
              onClick={handleSignOut}
              className="hidden sm:flex items-center justify-center p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-red-50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Sign Out"
            >
              <RiLogoutBoxLine className="text-xl" />
            </motion.button>

            {/* Mobile menu toggle */}
            <motion.button
              className="md:hidden p-2 rounded-xl hover:bg-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {mobileOpen ? <RiCloseLine className="text-xl" /> : <RiMenuLine className="text-xl" />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Notifications Panel */}
      <NotificationsPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Menu */}
            <motion.div
              className="absolute top-20 left-4 right-4 glass rounded-2xl p-4 shadow-xl"
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-1">
                {navLinks.map(({ path, label, icon: Icon }) => {
                  const isActive = location.pathname === path;
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMobileOpen(false)}
                    >
                      <motion.div
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                          ? 'gradient-primary text-white shadow-md'
                          : 'text-foreground hover:bg-muted'
                          }`}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Icon className="text-lg" />
                        {label}
                      </motion.div>
                    </Link>
                  );
                })}

                {/* Profile link in mobile */}
                <Link to="/profile" onClick={() => setMobileOpen(false)}>
                  <motion.div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${location.pathname === '/profile'
                      ? 'gradient-primary text-white shadow-md'
                      : 'text-foreground hover:bg-muted'
                      }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    <RiUserLine className="text-lg" />
                    Profile
                  </motion.div>
                </Link>

                <div className="border-t border-border my-2" />
                <motion.button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-red-50 transition-all"
                  whileTap={{ scale: 0.97 }}
                >
                  <RiLogoutBoxLine className="text-lg" />
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
