import React from 'react';
import { motion } from 'framer-motion';
import { Button, Card } from './UI';

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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="space-y-8"
    >
      {/* Welcome Message */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-center space-y-4"
      >
        <p className="text-neon-cyan text-xl font-light">Welcome Back</p>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          Improve your typing skills by racing against the rhythm of music. Type
          lyrics in sync with your favorite songs and master the art of fast,
          accurate typing.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <Card glow="cyan" className="text-center">
          <div className="space-y-2">
            <p className="text-neon-cyan/60 text-sm uppercase tracking-wider">
              Personal Best
            </p>
            <p className="font-display text-4xl font-bold text-neon-cyan">
              {personalBestWPM}
            </p>
            <p className="text-white/50 text-xs">Words Per Minute</p>
          </div>
        </Card>

        <Card glow="violet" className="text-center">
          <div className="space-y-2">
            <p className="text-neon-violet/60 text-sm uppercase tracking-wider">
              Games Played
            </p>
            <p className="font-display text-4xl font-bold text-neon-violet">
              {gamesPlayed}
            </p>
            <p className="text-white/50 text-xs">Total Sessions</p>
          </div>
        </Card>
      </div>

      {/* Main Action Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex justify-center"
      >
        <Button
          onClick={onPlayClick}
          variant="primary"
          size="lg"
          className="px-16"
        >
          ▶ Play Now
        </Button>
      </motion.div>

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
