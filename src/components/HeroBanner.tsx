import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Animated Waveform component that reacts to hover
 */
const Waveform: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  return (
    <div className="flex items-center gap-1 h-12">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${color}`}
          animate={{
            height: active 
              ? [ "20%", "100%", "40%", "80%", "20%" ] 
              : [ "20%", "40%", "20%" ],
          }}
          transition={{
            duration: active ? 0.6 + (i * 0.05) : 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

interface ModeOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  glow: string;
}

const MODES: ModeOption[] = [
  {
    id: 'beat',
    title: 'Beat Mode',
    description: 'Type to the rhythm of the music',
    icon: '🎼',
    color: 'bg-neon-cyan',
    glow: 'shadow-glow-cyan'
  },
  {
    id: 'speed',
    title: 'Speed Mode',
    description: 'Pure WPM test. No music, just speed.',
    icon: '⚡',
    color: 'bg-neon-violet',
    glow: 'shadow-glow-violet'
  },
  {
    id: 'practice',
    title: 'Practice Mode',
    description: 'Focus on your weak keys and patterns.',
    icon: '🧠',
    color: 'bg-neon-pink',
    glow: 'shadow-glow-pink'
  }
];

export const HeroBanner: React.FC<{ onSelectMode: (modeId: string) => void }> = ({ onSelectMode }) => {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  return (
    <div className="relative w-full rounded-[40px] overflow-hidden bg-gradient-to-br from-dark-card to-dark-bg border border-white/5 p-8 lg:p-12 mb-8">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
        <svg viewBox="0 0 400 400" className="w-full h-full fill-current text-neon-cyan animate-pulse-glow">
          <path d="M 0 200 Q 100 100 200 200 T 400 200" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M 0 250 Q 100 150 200 250 T 400 250" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl lg:text-5xl font-black mb-2 tracking-tighter"
        >
          START A SESSION
        </motion.h2>
        <p className="text-white/60 text-lg mb-10 max-w-md">
          Choose your play style and immerse yourself in the flow of the keyboard.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MODES.map((mode) => (
            <motion.button
              key={mode.id}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setHoveredMode(mode.id)}
              onMouseLeave={() => setHoveredMode(null)}
              onClick={() => onSelectMode(mode.id)}
              className={`relative group flex flex-col items-start text-left p-6 rounded-3xl transition-all ${
                hoveredMode === mode.id 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-white/5 border-white/5'
              } border backdrop-blur-sm overflow-hidden`}
            >
              {/* Mode Icon */}
              <div className={`w-12 h-12 rounded-2xl ${mode.color} ${mode.glow} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {mode.icon}
              </div>

              <h3 className="text-xl font-bold mb-1">{mode.title}</h3>
              <p className="text-sm text-white/50 mb-6">{mode.description}</p>

              {/* Animation Layer */}
              <div className="mt-auto w-full">
                <Waveform active={hoveredMode === mode.id} color={mode.color} />
              </div>

              {/* Selection Indicator */}
              <AnimatePresence>
                {hoveredMode === mode.id && (
                  <motion.div 
                    layoutId="outline"
                    className={`absolute inset-0 border-2 rounded-3xl pointer-events-none ${mode.id === 'beat' ? 'border-neon-cyan/30' : mode.id === 'speed' ? 'border-neon-violet/30' : 'border-neon-pink/30'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
