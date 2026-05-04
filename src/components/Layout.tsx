import React from 'react';
import { motion } from 'framer-motion';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

/**
 * Main header component with mystical styling
 */
export const Header: React.FC<HeaderProps> = ({
  title = 'TYPEBEAT',
  subtitle = 'Master the Rhythm of Typing',
}) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-8 mb-8"
    >
      <h1 className="font-display text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink mb-2 drop-shadow-lg">
        {title}
      </h1>
      <p className="text-neon-cyan/70 text-lg font-light">{subtitle}</p>
      <div className="flex justify-center gap-2 mt-4">
        <div className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse-glow" />
        <div className="w-1 h-1 rounded-full bg-neon-violet animate-pulse-glow" style={{ animationDelay: '0.2s' }} />
        <div className="w-1 h-1 rounded-full bg-neon-pink animate-pulse-glow" style={{ animationDelay: '0.4s' }} />
      </div>
    </motion.header>
  );
};

/**
 * Footer component
 */
export const Footer: React.FC = () => {
  return (
    <footer className="text-center py-4 text-neon-cyan/50 text-sm">
      <p>© 2026 Typebeat - Master Your Typing Skills 🎵</p>
    </footer>
  );
};

/**
 * Main layout wrapper
 */
export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 pb-8 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
};
