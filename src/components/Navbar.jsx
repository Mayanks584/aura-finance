import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
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
} from 'react-icons/ri';

const navLinks = [
  { path: '/', label: 'Dashboard', icon: RiDashboardLine },
  { path: '/income', label: 'Income', icon: RiMoneyDollarCircleLine },
  { path: '/expenses', label: 'Expenses', icon: RiShoppingBagLine },
  { path: '/budget', label: 'Budget', icon: RiPieChartLine },
  { path: '/transactions', label: 'Transactions', icon: RiExchangeLine },
  { path: '/reports', label: 'Reports', icon: RiBarChartLine },
];

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

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
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link key={path} to={path} className="relative">
                  <motion.div
                    className={`nav-item flex items-center gap-1.5 ${isActive ? 'active' : ''}`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Icon className="text-base" />
                    <span className="text-xs font-medium">{label}</span>
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
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                  {user.email?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-[120px] hidden lg:block">
                  {user.email}
                </span>
              </div>
            )}
            <motion.button
              onClick={handleSignOut}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-red-50 transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <RiLogoutBoxLine className="text-base" />
              <span className="hidden lg:block">Sign Out</span>
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
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive
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
