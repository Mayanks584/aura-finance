import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

// Animated mesh background with floating blobs
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden mesh-bg">
      {/* Blob 1 — Blue */}
      <motion.div
        className="absolute blob"
        style={{
          width: '600px',
          height: '600px',
          top: '-200px',
          left: '-200px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 60%, transparent 100%)',
          filter: 'blur(40px)',
        }}
        animate={{
          x: [0, 80, 0],
          y: [0, 60, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Blob 2 — Teal */}
      <motion.div
        className="absolute blob"
        style={{
          width: '500px',
          height: '500px',
          top: '30%',
          right: '-150px',
          background: 'radial-gradient(circle, rgba(13,148,136,0.15) 0%, rgba(13,148,136,0.05) 60%, transparent 100%)',
          filter: 'blur(40px)',
        }}
        animate={{
          x: [0, -60, 0],
          y: [0, 80, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      {/* Blob 3 — Indigo */}
      <motion.div
        className="absolute blob"
        style={{
          width: '400px',
          height: '400px',
          bottom: '0px',
          left: '30%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.04) 60%, transparent 100%)',
          filter: 'blur(40px)',
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, -40, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
};

// Page transition wrapper
export const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

// Scroll-reveal section
export const ScrollReveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start({ opacity: 1, y: 0 });
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={controls}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedBackground;
