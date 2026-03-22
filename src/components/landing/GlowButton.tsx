'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

export function GlowButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
}: GlowButtonProps) {
  const baseStyles = 'px-8 py-3 rounded-full font-semibold transition-all duration-300 relative';
  
  const variants = {
    primary: 'bg-sky-600 text-white hover:shadow-lg hover:shadow-sky-500/50',
    secondary: 'bg-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/50',
    outline: 'border border-cyan-500/50 text-cyan-400 glow-border hover:shadow-lg hover:shadow-cyan-500/30',
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
