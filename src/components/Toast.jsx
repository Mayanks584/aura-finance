import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCheckLine, RiErrorWarningLine, RiInformationLine, RiCloseLine } from 'react-icons/ri';

// Toast notification component
const Toast = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl glass border ${
              toast.type === 'success'
                ? 'border-success/30 bg-success/10'
                : toast.type === 'error'
                ? 'border-destructive/30 bg-destructive/10'
                : 'border-primary/30 bg-primary/10'
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              toast.type === 'success' ? 'bg-success text-white' :
              toast.type === 'error' ? 'bg-destructive text-white' : 'bg-primary text-white'
            }`}>
              {toast.type === 'success' ? <RiCheckLine /> :
               toast.type === 'error' ? <RiErrorWarningLine /> : <RiInformationLine />}
            </div>
            <p className="text-sm font-medium text-foreground flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <RiCloseLine />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
