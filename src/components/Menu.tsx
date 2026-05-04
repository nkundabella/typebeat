import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './UI';
import { HeroBanner } from './HeroBanner';

interface MenuScreenProps {
  onPlayClick: () => void;
  personalBestWPM: number;
  gamesPlayed: number;
}

/**
 * Main menu screen
 */
export const MenuScreen: React.FC<MenuScreenProps> = ({
  onPlayClick,
  personalBestWPM,
  gamesPlayed,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-10"
    >
      {/* Hero Banner Section */}
      <HeroBanner onSelectMode={(modeId) => {
        if (modeId === 'beat' || modeId === 'speed') {
          onPlayClick();
        }
      }} />

      {/* Stats Cards Section (Moved below banner) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card glow="cyan" className="flex items-center justify-between p-8 bg-dark-card/30 border-white/5">
          <div className="space-y-1">
            <p className="text-neon-cyan/60 text-xs uppercase tracking-[0.2em] font-bold">
              Lifetime Best
            </p>
            <p className="font-display text-5xl font-black text-white">
              {personalBestWPM} <span className="text-xl text-white/30 uppercase font-bold">WPM</span>
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-neon-cyan/10 flex items-center justify-center text-neon-cyan text-3xl">
            🏆
          </div>
        </Card>

        <Card glow="violet" className="flex items-center justify-between p-8 bg-dark-card/30 border-white/5">
          <div className="space-y-1">
            <p className="text-neon-violet/60 text-xs uppercase tracking-[0.2em] font-bold">
              Total Sessions
            </p>
            <p className="font-display text-5xl font-black text-white">
              {gamesPlayed} <span className="text-xl text-white/30 uppercase font-bold">Runs</span>
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-neon-violet/10 flex items-center justify-center text-neon-violet text-3xl">
            ⌨️
          </div>
        </Card>
      </div>

      {/* Features Preview */}
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card glow="none" className="text-center space-y-3">
          <h3 className="font-display text-lg text-neon-gold">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="space-y-1">
              <p className="text-neon-cyan font-semibold">🎵 Music Sync</p>
              <p className="text-white/60">Type lyrics in rhythm</p>
            </div>
            <div className="space-y-1">
              <p className="text-neon-violet font-semibold">📊 Real-time Stats</p>
              <p className="text-white/60">Track WPM & accuracy</p>
            </div>
            <div className="space-y-1">
              <p className="text-neon-pink font-semibold">🏆 Progression</p>
              <p className="text-white/60">Unlock new songs</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
