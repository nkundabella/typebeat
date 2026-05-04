import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, ProgressBar, Badge } from './UI';
import { TypingEngine } from '@/engine/TypingEngine';
import { calculateWPM, calculateAccuracy } from '@/engine/wpmCalculator';
import type { CharacterStatus } from '@/types';

interface TypingGameProps {
  lyrics: string;
  songTitle: string;
  artist: string;
  onComplete: (stats: {
    totalChars: number;
    correctChars: number;
    elapsedTime: number;
    wpm: number;
    accuracy: number;
  }) => void;
  onBack: () => void;
}

/**
 * Main typing game component
 */
export const TypingGame: React.FC<TypingGameProps> = ({
  lyrics,
  songTitle,
  artist,
  onComplete,
  onBack,
}) => {
  const [engine] = useState(() => new TypingEngine(lyrics));
  const [characterStates, setCharacterStates] = useState<CharacterStatus[]>(
    engine.getCharacterStates()
  );
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);

  // Timer effect
  useEffect(() => {
    if (isGameComplete) return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 100);

    return () => clearInterval(timer);
  }, [isGameComplete]);

  // Keyboard input handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameComplete) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        engine.removeCharacter();
      } else if (e.key.length === 1) {
        e.preventDefault();
        engine.addCharacter(e.key);
      }

      const stats = engine.getStats();
      setCharacterStates([...engine.getCharacterStates()]);

      if (stats.isComplete) {
        setIsGameComplete(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine, isGameComplete]);

  const stats = engine.getStats();
  const wpm = calculateWPM(stats.typedChars, elapsedTime / 10); // Convert centiseconds to seconds
  const accuracy = calculateAccuracy(stats.correctChars, stats.typedChars);

  const handleComplete = () => {
    const totalTime = elapsedTime / 10; // Convert to seconds
    onComplete({
      totalChars: stats.totalChars,
      correctChars: stats.correctChars,
      elapsedTime: totalTime,
      wpm,
      accuracy,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Song Info */}
      <Card glow="cyan" className="text-center">
        <h2 className="font-display text-2xl font-bold text-neon-cyan mb-2">
          {songTitle}
        </h2>
        <p className="text-neon-violet/70">{artist}</p>
      </Card>

      {/* Stats Panel */}
      <div className="grid grid-cols-3 gap-4">
        <Card glow="cyan" className="text-center">
          <p className="text-neon-cyan/60 text-xs uppercase tracking-widest">WPM</p>
          <p className="font-display text-3xl font-bold text-neon-cyan">
            {wpm.toFixed(1)}
          </p>
        </Card>
        <Card glow="violet" className="text-center">
          <p className="text-neon-violet/60 text-xs uppercase tracking-widest">Accuracy</p>
          <p className="font-display text-3xl font-bold text-neon-violet">
            {accuracy.toFixed(1)}%
          </p>
        </Card>
        <Card glow="pink" className="text-center">
          <p className="text-neon-pink/60 text-xs uppercase tracking-widest">Time</p>
          <p className="font-display text-3xl font-bold text-neon-pink">
            {(elapsedTime / 10).toFixed(1)}s
          </p>
        </Card>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-neon-cyan/60">
          <span>Progress</span>
          <span>
            {stats.typedChars} / {stats.totalChars}
          </span>
        </div>
        <ProgressBar
          current={stats.typedChars}
          total={stats.totalChars}
          color="cyan"
        />
      </div>

      {/* Typing Display */}
      <Card glow="violet" className="min-h-32">
        <div className="space-y-4">
          {/* Target Text Highlight */}
          <div className="text-2xl font-display leading-loose text-center">
            {characterStates.map((char, idx) => (
              <span
                key={idx}
                className={`transition-all duration-100 ${
                  !char.typed
                    ? 'text-white/50'
                    : char.correct
                      ? 'text-neon-cyan font-bold'
                      : 'text-neon-pink font-bold bg-neon-pink/20'
                }`}
              >
                {char.char}
              </span>
            ))}
          </div>

          {/* Current Input Position Indicator */}
          <div className="text-center">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-0.5 h-8 bg-neon-cyan"
            />
          </div>
        </div>
      </Card>

      {/* Keystroke Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card glow="none" className="text-center">
          <p className="text-neon-cyan/60 text-xs uppercase">Correct</p>
          <p className="text-2xl font-bold text-neon-cyan">
            {stats.correctChars}
          </p>
        </Card>
        <Card glow="none" className="text-center">
          <p className="text-neon-pink/60 text-xs uppercase">Incorrect</p>
          <p className="text-2xl font-bold text-neon-pink">
            {stats.incorrectChars}
          </p>
        </Card>
      </div>

      {/* Action Buttons */}
      {isGameComplete ? (
        <div className="flex justify-center gap-4">
          <button
            onClick={handleComplete}
            className="px-8 py-3 bg-gradient-to-r from-neon-cyan to-neon-violet hover:shadow-glow-cyan rounded-lg font-display font-bold text-dark-bg transition-all"
          >
            View Results
          </button>
          <button
            onClick={onBack}
            className="px-8 py-3 bg-dark-card border-2 border-neon-violet hover:border-neon-cyan rounded-lg font-display font-bold text-white transition-all"
          >
            Back
          </button>
        </div>
      ) : (
        <div className="text-center text-neon-cyan/60 text-sm">
          Start typing to begin...
        </div>
      )}
    </motion.div>
  );
};
