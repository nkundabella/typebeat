import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './UI';

/**
 * Heatmap component for typing activity
 */
const StreakHeatmap: React.FC = () => {
  // Mock data for the last 4 weeks
  const weeks = 4;
  const days = 7;
  const activity = Array.from({ length: weeks * days }, () => Math.floor(Math.random() * 5));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-[10px] text-white/30 uppercase font-black tracking-widest px-1">
        <span>Activity History</span>
        <span>Last 30 Days</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5 p-1">
        {activity.map((val, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.01 }}
            className={`aspect-square rounded-[4px] ${
              val === 0 ? 'bg-white/5' : 
              val === 1 ? 'bg-neon-cyan/20' : 
              val === 2 ? 'bg-neon-cyan/40' : 
              val === 3 ? 'bg-neon-cyan/60 shadow-glow-cyan' : 
              'bg-neon-cyan shadow-glow-cyan'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Flow Chart component (Simple SVG line)
 */
const FlowChart: React.FC = () => {
  const points = [10, 40, 30, 70, 45, 90, 80];
  const path = points.map((p, i) => `${i * 40},${100 - p}`).join(' L ');

  return (
    <div className="h-24 w-full mt-4">
      <svg viewBox="0 0 240 100" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={`M 0,100 L ${path} L 240,100 Z`}
          fill="url(#flowGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.path
          d={`M ${path}`}
          fill="none"
          stroke="#00f0ff"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={i * 40}
            cy={100 - p}
            r="4"
            fill="#0a0e27"
            stroke="#00f0ff"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 + i * 0.1 }}
          />
        ))}
      </svg>
    </div>
  );
};

export const StatsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-black tracking-tight text-white uppercase">Performance Metrics</h2>
        <div className="flex gap-2">
          {['Day', 'Week', 'Month'].map((t) => (
            <button key={t} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${t === 'Week' ? 'bg-neon-cyan/20 border-neon-cyan/40 text-neon-cyan' : 'border-white/5 text-white/30 hover:text-white/50 transition-colors'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consistency Score */}
        <Card glow="violet" className="flex flex-col p-6 bg-dark-card/30 border-white/5 relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center justify-center py-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                <motion.circle 
                  cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" 
                  className="text-neon-violet"
                  strokeDasharray="364"
                  initial={{ strokeDashoffset: 364 }}
                  animate={{ strokeDashoffset: 364 * 0.15 }} // 85% score
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white">85</span>
                <span className="text-[10px] text-white/30 uppercase font-black">Consistency</span>
              </div>
            </div>
            <p className="mt-6 text-sm text-white/50 text-center px-4">
              Your timing is <span className="text-neon-violet font-bold">12% more stable</span> than last week.
            </p>
          </div>
        </Card>

        {/* Typing Flow */}
        <Card glow="cyan" className="flex flex-col p-6 bg-dark-card/30 border-white/5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Typing Flow</h3>
              <p className="text-xs text-white/30 uppercase font-bold">Smoothness Index</p>
            </div>
            <span className="text-neon-cyan font-black text-2xl">A+</span>
          </div>
          <FlowChart />
          <div className="mt-auto pt-4 flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-xl font-black text-white">100%</span>
              <span className="text-[10px] text-white/30 uppercase font-bold">Peak Flow</span>
            </div>
            <div className="text-[10px] text-neon-cyan font-black uppercase bg-neon-cyan/10 px-2 py-1 rounded">Improving</div>
          </div>
        </Card>

        {/* Heatmap & Streak */}
        <Card glow="none" className="flex flex-col p-6 bg-dark-card/30 border-white/5">
          <StreakHeatmap />
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔥</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white leading-none">5 Day Streak</span>
                  <span className="text-[10px] text-white/30 uppercase font-bold">Current</span>
                </div>
              </div>
              <div className="text-xs font-bold text-neon-gold">Best: 12</div>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xl">🎯</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white leading-none">98.5% Accuracy</span>
                  <span className="text-[10px] text-white/30 uppercase font-bold">Average</span>
                </div>
              </div>
              <div className="text-xs font-bold text-neon-pink">+0.2%</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
