import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

/**
 * Reusable button component with mystical styling
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  glow = true,
  children,
  className,
  ...props
}) => {
  const baseStyles =
    'font-display font-semibold rounded-lg transition-all duration-300';

  const variants = {
    primary: `${glow ? 'shadow-glow-cyan' : ''} bg-gradient-to-r from-neon-cyan to-neon-violet hover:shadow-lg text-dark-bg`,
    secondary: `${glow ? 'shadow-glow-violet' : ''} bg-dark-card border-2 border-neon-violet hover:border-neon-cyan text-white`,
    danger: `${glow ? 'shadow-glow-pink' : ''} bg-dark-card border-2 border-neon-pink hover:border-neon-pink text-neon-pink`,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  // Filter out event handlers that conflict with Framer Motion button props
  const { onAnimationStart, onDragStart, onDragEnd, onDrag, ...safeProps } = props as any;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...safeProps}
    >
      {children}
    </motion.button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'violet' | 'pink' | 'gold' | 'none';
}

/**
 * Glassmorphic card component
 */
export const Card: React.FC<CardProps> = ({
  children,
  className,
  glow = 'violet',
}) => {
  const glowVariants = {
    cyan: 'shadow-glow-cyan',
    violet: 'shadow-glow-violet',
    pink: 'shadow-glow-pink',
    gold: '',
    none: '',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-dark-card/80 backdrop-blur-sm border border-neon-violet/30 rounded-xl p-6 ${glowVariants[glow]} ${className}`}
    >
      {children}
    </motion.div>
  );
};

interface ProgressBarProps {
  current: number;
  total: number;
  color?: 'cyan' | 'violet' | 'pink' | 'gold';
}

/**
 * Animated progress bar component
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  color = 'cyan',
}) => {
  const percentage = (current / total) * 100;

  const colorMap = {
    cyan: 'bg-neon-cyan',
    violet: 'bg-neon-violet',
    pink: 'bg-neon-pink',
    gold: 'bg-neon-gold',
  };

  return (
    <div className="w-full bg-dark-card rounded-full h-2 overflow-hidden border border-neon-violet/20">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.3 }}
        className={`h-full ${colorMap[color]} shadow-lg`}
        style={{
          boxShadow: `0 0 10px ${color === 'cyan' ? 'rgba(0, 240, 255, 0.8)' : color === 'violet' ? 'rgba(189, 0, 255, 0.8)' : color === 'pink' ? 'rgba(255, 0, 255, 0.8)' : 'rgba(255, 215, 0, 0.8)'}`,
        }}
      />
    </div>
  );
};

interface BadgeProps {
  label: string;
  color?: 'cyan' | 'violet' | 'pink' | 'gold';
}

/**
 * Badge component for tags and labels
 */
export const Badge: React.FC<BadgeProps> = ({ label, color = 'cyan' }) => {
  const colorMap = {
    cyan: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50',
    violet: 'bg-neon-violet/20 text-neon-violet border-neon-violet/50',
    pink: 'bg-neon-pink/20 text-neon-pink border-neon-pink/50',
    gold: 'bg-neon-gold/20 text-neon-gold border-neon-gold/50',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorMap[color]}`}
    >
      {label}
    </span>
  );
};
