import React from 'react';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

/**
 * Premium Dashboard Layout with a three-column grid
 * Optimized for the "TypeBeat" gaming aesthetic.
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebar,
  children,
  rightPanel,
}) => {
  return (
    <div className="min-h-screen bg-dark-bg text-white font-display overflow-hidden flex flex-col">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-violet/10 blur-[120px] rounded-full animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 blur-[120px] rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Grid Container */}
      <div className="relative z-10 flex flex-1 overflow-hidden p-4 lg:p-6 gap-6">
        {/* Left Sidebar */}
        <motion.aside
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-80 flex-shrink-0 flex flex-col"
        >
          {sidebar}
        </motion.aside>

        {/* Central Content Area */}
        <main className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          {children}
        </main>

        {/* Right Social Panel (Optional) */}
        {rightPanel && (
          <motion.aside
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-80 flex-shrink-0 hidden xl:flex flex-col"
          >
            {rightPanel}
          </motion.aside>
        )}
      </div>
    </div>
  );
};
