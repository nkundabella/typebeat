import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, ProgressBar } from './UI';
import { TypingEngine } from '@/engine/TypingEngine';
import { calculateWPM, calculateAccuracy } from '@/engine/wpmCalculator';
import type { CharacterStatus } from '@/types';

interface TypingGameProps {
  lyrics: string;
  songTitle: string;
  artist: string;
  audioUrl?: string;
  syncedLyrics?: string | null;
  onComplete: (stats: {
    totalChars: number;
    correctChars: number;
    elapsedTime: number;
    wpm: number;
    accuracy: number;
  }) => void;
  onBack: () => void;
}

interface SyncedLine {
  time: number; // in seconds
  text: string;
}

/**
 * Main typing game component with audio integration and synced lyrics scroll
 */
export const TypingGame: React.FC<TypingGameProps> = ({
  lyrics,
  songTitle,
  artist,
  audioUrl,
  syncedLyrics,
  onComplete,
  onBack,
}) => {
  const [engine] = useState(() => new TypingEngine(lyrics));
  const [characterStates, setCharacterStates] = useState<CharacterStatus[]>(
    engine.getCharacterStates()
  );
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5); // Default 50% volume
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Synced lyrics state
  const [syncedLines, setSyncedLines] = useState<SyncedLine[]>([]);
  const [activeLineIdx, setActiveLineIdx] = useState<number>(-1);

  // 1. Parse synchronized LRC lyrics on mount
  useEffect(() => {
    if (syncedLyrics) {
      const lines = syncedLyrics.split('\n');
      const parsed: SyncedLine[] = [];
      const timeRegex = /\[(\d+):(\d+)\.(\d+)\]/;

      for (const line of lines) {
        const match = timeRegex.exec(line);
        if (match) {
          const minutes = parseInt(match[1], 10);
          const seconds = parseInt(match[2], 10);
          const milliseconds = parseInt(match[3], 10);
          const time = minutes * 60 + seconds + milliseconds / 100;
          const text = line.replace(timeRegex, '').trim();
          if (text) {
            parsed.push({ time, text });
          }
        }
      }
      setSyncedLines(parsed.sort((a, b) => a.time - b.time));
    }
  }, [syncedLyrics]);

  // 2. Initialize and manage HTML5 Audio playback
  useEffect(() => {
    if (audioUrl) {
      console.log('Loading song audio track:', audioUrl);
      const audio = new Audio(audioUrl);
      audio.volume = volume;
      audio.preload = 'auto';
      audioRef.current = audio;

      // Sync typing clock to the exact audio playhead
      const handleTimeUpdate = () => {
        if (!isGameComplete && audio.currentTime > 0) {
          setElapsedTime(Math.round(audio.currentTime * 10)); // Tenths of a second
          
          // Identify the current synced vocal line
          if (syncedLines.length > 0) {
            const currentSec = audio.currentTime;
            let activeIdx = -1;
            for (let i = 0; i < syncedLines.length; i++) {
              if (currentSec >= syncedLines[i].time) {
                activeIdx = i;
              } else {
                break;
              }
            }
            setActiveLineIdx(activeIdx);
          }
        }
      };

      const handleAudioEnded = () => {
        setIsPlaying(false);
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleAudioEnded);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleAudioEnded);
        audio.pause();
        audioRef.current = null;
      };
    }
  }, [audioUrl, syncedLines, isGameComplete]);

  // 3. Keep audio volume reactive
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 4. Timer fallback if running in offline mode (no audioUrl)
  useEffect(() => {
    if (audioUrl || isGameComplete || !gameStarted) return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 100);

    return () => clearInterval(timer);
  }, [audioUrl, isGameComplete, gameStarted]);

  // 5. Keyboard input handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameComplete) return;

      // Ignore modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const triggerGameStart = () => {
        if (!gameStarted) {
          setGameStarted(true);
          if (audioRef.current) {
            audioRef.current.play()
              .then(() => setIsPlaying(true))
              .catch((err) => console.error('Audio play failed:', err));
          }
        }
      };

      if (e.key === 'Backspace') {
        e.preventDefault();
        engine.removeCharacter();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        triggerGameStart();
        engine.addCharacter('\n');
      } else if (e.key.length === 1) {
        e.preventDefault();
        triggerGameStart();
        engine.addCharacter(e.key);
      }

      const stats = engine.getStats();
      setCharacterStates([...engine.getCharacterStates()]);

      if (stats.isComplete) {
        setIsGameComplete(true);
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine, isGameComplete, gameStarted]);

  const stats = engine.getStats();
  const wpm = calculateWPM(stats.correctChars, elapsedTime / 10);
  const accuracy = calculateAccuracy(stats.correctChars, stats.typedChars);

  const handleComplete = () => {
    const totalTime = elapsedTime / 10;
    onComplete({
      totalChars: stats.totalChars,
      correctChars: stats.correctChars,
      elapsedTime: totalTime,
      wpm,
      accuracy,
    });
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          if (!gameStarted) setGameStarted(true);
        })
        .catch(err => console.error(err));
    }
  };

  const handleBackClick = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Equalizer & Song Header */}
      <Card glow="cyan" className="relative overflow-hidden py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
          <button
            onClick={handleBackClick}
            className="text-white/40 hover:text-neon-cyan text-sm font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            ← Leave
          </button>
          
          <div className="text-center flex-grow">
            <h2 className="font-display text-2xl font-bold text-neon-cyan leading-tight flex items-center justify-center gap-3">
              {songTitle}
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-6 w-6">
                  {[...Array(4)].map((_, i) => (
                    <span
                      key={i}
                      className="bg-neon-cyan w-1 rounded-t-sm"
                      style={{
                        animation: 'eq-bounce 0.8s ease-in-out infinite alternate',
                        animationDelay: `${i * 0.15}s`,
                        height: '100%',
                        transformOrigin: 'bottom'
                      }}
                    />
                  ))}
                  <style>{`
                    @keyframes eq-bounce {
                      0% { transform: scaleY(0.15); }
                      100% { transform: scaleY(1); }
                    }
                  `}</style>
                </div>
              )}
            </h2>
            <p className="text-neon-violet/70 text-sm mt-0.5">{artist}</p>
          </div>

          {/* Music Play/Pause & Volume Overlay */}
          {audioUrl ? (
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlayback}
                className="w-10 h-10 rounded-full bg-dark-card border border-white/10 flex items-center justify-center text-neon-cyan hover:border-neon-cyan/50 hover:shadow-glow-cyan transition-all"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">🔊</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 rounded-lg appearance-none cursor-pointer bg-white/10 accent-neon-cyan focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <span className="text-white/20 text-xs uppercase tracking-wider font-bold">Offline Sync</span>
          )}
        </div>
      </Card>

      {/* Karaoke Sync Vocal Line */}
      {syncedLines.length > 0 && activeLineIdx >= 0 && (
        <Card glow="pink" className="bg-neon-pink/10 border-neon-pink/20 py-3 text-center border overflow-hidden">
          <p className="text-neon-pink text-[10px] uppercase tracking-widest font-black mb-1">🎙 Active Vocals</p>
          <motion.p
            key={activeLineIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-lg font-bold text-white tracking-wide"
          >
            {syncedLines[activeLineIdx].text}
          </motion.p>
        </Card>
      )}

      {/* Live Performance Panel */}
      <div className="grid grid-cols-3 gap-4">
        <Card glow="cyan" className="text-center py-4">
          <p className="text-neon-cyan/60 text-xs uppercase tracking-widest font-bold">WPM</p>
          <p className="font-display text-3xl font-black text-neon-cyan mt-1">
            {wpm.toFixed(1)}
          </p>
        </Card>
        <Card glow="violet" className="text-center py-4">
          <p className="text-neon-violet/60 text-xs uppercase tracking-widest font-bold">Accuracy</p>
          <p className="font-display text-3xl font-black text-neon-violet mt-1">
            {accuracy.toFixed(1)}%
          </p>
        </Card>
        <Card glow="pink" className="text-center py-4">
          <p className="text-neon-pink/60 text-xs uppercase tracking-widest font-bold">Time</p>
          <p className="font-display text-3xl font-black text-neon-pink mt-1">
            {(elapsedTime / 10).toFixed(1)}s
          </p>
        </Card>
      </div>

      {/* Progress Tracker */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-neon-cyan/60 font-bold px-1">
          <span>Completion Progress</span>
          <span>
            {stats.typedChars} / {stats.totalChars} chars
          </span>
        </div>
        <ProgressBar
          current={stats.typedChars}
          total={stats.totalChars}
          color="cyan"
        />
      </div>

      {/* Interactive Typing Box */}
      <Card glow="violet" className="min-h-32 p-8 relative">
        <div className="space-y-4">
          <div className="text-2xl font-mono leading-relaxed text-center whitespace-pre-wrap select-none tracking-wide">
            {characterStates.map((char, idx) => {
              // Show blinking cursor at the current input point
              const isCurrent = idx === stats.typedChars;
              return (
                <span
                  key={idx}
                  className={`transition-all duration-100 ${
                    isCurrent
                      ? 'border-b-2 border-neon-cyan text-white font-bold bg-neon-cyan/10'
                      : !char.typed
                        ? 'text-white/35 font-medium'
                        : char.correct
                          ? 'text-neon-cyan font-bold drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                          : 'text-neon-pink font-bold bg-neon-pink/20 drop-shadow-[0_0_8px_rgba(255,0,255,0.4)]'
                  }`}
                >
                  {char.char === '\n' ? '↵\n' : char.char}
                </span>
              );
            })}
          </div>

          {!gameStarted && (
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="text-center text-neon-cyan/50 text-sm font-display tracking-widest uppercase mt-4"
            >
              🎹 Start typing the lyrics to begin playback...
            </motion.div>
          )}
        </div>
      </Card>

      {/* Action Submit Buttons */}
      {isGameComplete && (
        <div className="flex justify-center pt-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={handleComplete}
              className="px-10 py-4 bg-gradient-to-r from-neon-cyan to-neon-violet hover:shadow-glow-cyan rounded-2xl font-display font-black text-dark-bg transition-all uppercase tracking-widest"
            >
              Finish & View Results
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

