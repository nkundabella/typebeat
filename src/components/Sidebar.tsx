import React from 'react';
import { motion } from 'framer-motion';

/**
 * Mini Visualizer component to add life to the sidebar
 */
const MiniVisualizer: React.FC = () => {
  return (
    <div className="flex items-end justify-center gap-1 h-8 px-2">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-neon-cyan to-neon-violet rounded-full"
          animate={{
            height: [ '20%', '100%', '40%', '80%', '20%'],
          }}
          transition={{
            duration: 0.8 + Math.random() * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  );
};

interface SidebarProps {
  userStats?: {
    wpm: number;
    accuracy: number;
    level: number;
    rank: string;
    streak: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  userStats = {
    wpm: 65,
    accuracy: 98.5,
    level: 12,
    rank: "Rhythm Rookie",
    streak: 5
  }
}) => {
  return (
    <div className="flex flex-col h-full gap-6">
      {/* Brand Section */}
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-violet flex items-center justify-center shadow-glow-cyan overflow-hidden">
          <span className="text-2xl">🎧</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
          TYPEBEAT
        </h1>
      </div>

      {/* User Profile Card */}
      <div className="p-5 rounded-3xl bg-dark-card/50 border border-white/10 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
          <MiniVisualizer />
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-neon-violet to-neon-pink p-0.5 shadow-glow-violet">
            <div className="w-full h-full rounded-2xl bg-dark-bg flex items-center justify-center overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User Avatar" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg leading-none">William_Prime</h3>
            <span className="text-neon-cyan text-sm font-medium">{userStats.rank}</span>
          </div>
        </div>

        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-white/50">Level {userStats.level}</span>
            <span className="text-neon-violet">1,240 / 2,500 XP</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '45%' }}
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet shadow-glow-cyan"
            />
          </div>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-3xl bg-dark-card/30 border border-white/5 backdrop-blur-sm flex flex-col items-center">
          <span className="text-white/40 text-xs uppercase tracking-widest mb-1">Avg WPM</span>
          <span className="text-2xl font-bold text-neon-cyan">{userStats.wpm}</span>
        </div>
        <div className="p-4 rounded-3xl bg-dark-card/30 border border-white/5 backdrop-blur-sm flex flex-col items-center">
          <span className="text-white/40 text-xs uppercase tracking-widest mb-1">Accuracy</span>
          <span className="text-2xl font-bold text-neon-pink">{userStats.accuracy}%</span>
        </div>
      </div>

      {/* Streak & Activity */}
      <div className="p-5 rounded-3xl bg-dark-card/50 border border-white/10 backdrop-blur-md flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="font-bold">{userStats.streak} Day Streak</span>
          </div>
          <div className="text-xs text-neon-gold font-bold bg-neon-gold/10 px-2 py-1 rounded-lg">PRO</div>
        </div>

        <hr className="border-white/5" />

        <div>
          <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Favorite Genres</h4>
          <div className="flex flex-wrap gap-2">
            {['Lofi', 'Synthwave', 'EDM', 'Hip-Hop'].map((genre) => (
              <span key={genre} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium hover:bg-neon-cyan/10 hover:border-neon-cyan/30 transition-colors cursor-pointer">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="mt-auto flex flex-col gap-2">
        {['Dashboard', 'Library', 'Challenges', 'Shop', 'Settings'].map((item) => (
          <button 
            key={item}
            className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
              item === 'Dashboard' 
                ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${item === 'Dashboard' ? 'bg-neon-cyan shadow-glow-cyan' : 'bg-transparent'}`} />
            <span className="font-bold">{item}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
