import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './UI';
import { calculateScore } from '@/engine/wpmCalculator';

interface GameResultsProps {
  songTitle: string;
  artist: string;
  stats: {
    totalChars: number;
    correctChars: number;
    elapsedTime: number;
    wpm: number;
    accuracy: number;
  };
  onPlayAgain: () => void;
  onSelectDifferent: () => void;
  onBackToMenu: () => void;
}

/**
 * Game results/summary screen
 */
export const GameResults: React.FC<GameResultsProps> = ({
  songTitle,
  artist,
  stats,
  onPlayAgain,
  onSelectDifferent,
  onBackToMenu,
}) => {
  const score = calculateScore(stats.wpm, stats.accuracy);

  // Performance rating
  const getRating = (wpm: number) => {
    if (wpm >= 100) return { label: 'LEGENDARY', color: 'text-neon-gold' };
    if (wpm >= 80) return { label: 'AMAZING', color: 'text-neon-cyan' };
    if (wpm >= 60) return { label: 'GREAT', color: 'text-neon-violet' };
    if (wpm >= 40) return { label: 'GOOD', color: 'text-neon-pink' };
    return { label: 'KEEP PRACTICING', color: 'text-white/70' };
  };

  const rating = getRating(stats.wpm);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Song Info */}
      <Card glow="cyan" className="text-center">
        <h2 className="font-display text-2xl font-bold text-neon-cyan mb-1">
          {songTitle}
        </h2>
        <p className="text-neon-violet/70">{artist}</p>
      </Card>

      {/* Performance Rating */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <p className={`font-display text-5xl font-bold ${rating.color} mb-2`}>
          {rating.label}
        </p>
        <p className="text-neon-gold text-2xl font-display font-bold">
          Score: {score}
        </p>
      </motion.div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card glow="cyan" className="text-center">
            <p className="text-neon-cyan/60 text-xs uppercase">WPM</p>
            <p className="font-display text-3xl font-bold text-neon-cyan">
              {stats.wpm.toFixed(1)}
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card glow="violet" className="text-center">
            <p className="text-neon-violet/60 text-xs uppercase">Accuracy</p>
            <p className="font-display text-3xl font-bold text-neon-violet">
              {stats.accuracy.toFixed(1)}%
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card glow="pink" className="text-center">
            <p className="text-neon-pink/60 text-xs uppercase">Time</p>
            <p className="font-display text-3xl font-bold text-neon-pink">
              {stats.elapsedTime.toFixed(1)}s
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card glow="gold" className="text-center">
            <p className="text-neon-gold/60 text-xs uppercase">Chars</p>
            <p className="font-display text-3xl font-bold text-neon-gold">
              {stats.correctChars}/{stats.totalChars}
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Breakdown */}
      <Card glow="none" className="space-y-4">
        <h3 className="font-display text-lg text-neon-cyan">Breakdown</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/60 text-xs uppercase">Total Time</p>
            <p className="text-white font-semibold">
              {Math.floor(stats.elapsedTime)}s
            </p>
          </div>
          <div>
            <p className="text-white/60 text-xs uppercase">Correct Chars</p>
            <p className="text-neon-cyan font-semibold">
              {stats.correctChars}
            </p>
          </div>
          <div>
            <p className="text-white/60 text-xs uppercase">Errors</p>
            <p className="text-neon-pink font-semibold">
              {stats.totalChars - stats.correctChars}
            </p>
          </div>
          <div>
            <p className="text-white/60 text-xs uppercase">Total Chars</p>
            <p className="text-white font-semibold">{stats.totalChars}</p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={onPlayAgain}
          className="px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-violet hover:shadow-glow-cyan rounded-lg font-display font-bold text-dark-bg transition-all"
        >
          🔄 Play Again
        </button>
        <button
          onClick={onSelectDifferent}
          className="px-6 py-3 bg-dark-card border-2 border-neon-violet hover:border-neon-cyan rounded-lg font-display font-bold text-white transition-all"
        >
          🎵 Different Song
        </button>
        <button
          onClick={onBackToMenu}
          className="px-6 py-3 bg-dark-card border-2 border-neon-pink hover:border-neon-pink rounded-lg font-display font-bold text-neon-pink transition-all"
        >
          ← Menu
        </button>
      </div>
    </motion.div>
  );
};
