import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToastNotify } from '../context/ToastContext';
import { RiSparklingLine, RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiUserLine } from 'react-icons/ri';

// Animated floating label input
const FloatingInput = ({ label, type = 'text', value, onChange, error, icon: Icon }) => {
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPass ? 'text' : 'password') : type;

  return (
    <div className="space-y-1">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Icon className="text-lg" />
        </div>
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder=" "
          className={`w-full pl-11 pr-12 pt-6 pb-2 rounded-2xl border bg-white/60 backdrop-blur-sm text-foreground text-sm outline-none transition-all duration-300 ${error ? 'border-destructive/60 focus:ring-destructive/20' : 'border-border focus:border-primary'
            } focus:ring-2 focus:ring-primary/15`}
        />
        <label className={`absolute left-11 text-muted-foreground pointer-events-none transition-all duration-200 ${value ? 'top-2 text-xs font-medium text-primary' : 'top-1/2 -translate-y-1/2 text-sm'
          }`}>
          {label}
        </label>
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-destructive ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { addToast } = useToastNotify();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!isLogin) {
      if (!username.trim()) errs.username = 'Username is required';
      else if (username.trim().length < 2) errs.username = 'Username must be at least 2 characters';
    }
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) { addToast(error.message, 'error'); }
        else { addToast('Welcome back! 🎉', 'success'); navigate('/'); }
      } else {
        const { error } = await signUp(email, password, username.trim());
        if (error) { addToast(error.message, 'error'); }
        else { addToast('Account created! Check your email to verify.', 'success'); setIsLogin(true); }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Gradient Illustration */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-hero"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute w-80 h-80 rounded-full"
            style={{ background: 'rgba(255,255,255,0.1)', top: '-40px', right: '-40px' }}
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-60 h-60 rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)', bottom: '10%', left: '-30px' }}
            animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
            transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center p-16 text-center text-white">
          {/* Logo */}
          <motion.div
            className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-8 shadow-xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <RiSparklingLine className="text-3xl text-white" />
          </motion.div>

          <motion.h1
            className="text-5xl font-black mb-4 leading-tight"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Finance
            <br />
            <span className="text-white/80">Made Simple</span>
          </motion.h1>

          <motion.p
            className="text-white/70 text-lg max-w-xs leading-relaxed"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Track income, manage expenses, set budgets — all in one beautiful place.
          </motion.p>

          {/* Feature list */}
          <motion.div
            className="mt-10 space-y-3 w-full max-w-xs"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {['Smart spending insights', 'Visual budget tracking', 'Income & expense analytics', 'Real-time financial health'].map((feat, i) => (
              <motion.div
                key={feat}
                className="flex items-center gap-3 text-white/80 text-sm"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                {feat}
              </motion.div>
            ))}
          </motion.div>

          {/* Floating cards preview */}
          <motion.div
            className="absolute bottom-12 right-8 bg-white/15 backdrop-blur rounded-2xl p-4 text-left shadow-xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <p className="text-white/60 text-xs mb-1">Monthly Savings</p>
            <p className="text-white font-bold text-2xl">₹24,500</p>
            <p className="text-green-300 text-xs">↑ 12% from last month</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel — Auth Form */}
      <motion.div
        className="flex-1 flex items-center justify-center p-8 mesh-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-full max-w-md"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <RiSparklingLine className="text-white" />
            </div>
            <span className="font-black text-xl">Finance<span className="text-gradient">OS</span></span>
          </div>

          {/* Card */}
          <div className="card-glass p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-foreground mb-2">
                {isLogin ? 'Welcome back' : 'Get started'}
              </h2>
              <p className="text-muted-foreground text-sm">
                {isLogin ? 'Sign in to your account' : 'Create your free account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    key="username-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <FloatingInput
                      label="Username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      error={errors.username}
                      icon={RiUserLine}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <FloatingInput
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                icon={RiMailLine}
              />
              <FloatingInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                icon={RiLockLine}
              />

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl gradient-primary text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all disabled:opacity-70"
                whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(59,130,246,0.3)' }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : isLogin ? 'Sign In' : 'Create Account'}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <span className="font-semibold text-primary">
                  {isLogin ? 'Sign up free' : 'Sign in'}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
