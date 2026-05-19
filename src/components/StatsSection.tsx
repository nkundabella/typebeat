import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './UI';

interface StatsSectionProps {
  scoreHistory: any[];
  personalBestWPM: number;
  gamesPlayed: number;
  avgAccuracy: number;
}

/**
 * Dynamic Heatmap component for typing activity based on database timestamps
 */
const StreakHeatmap: React.FC<{ scoreHistory: any[] }> = ({ scoreHistory }) => {
  const weeks = 4;
  const days = 7;
  const totalDays = weeks * days;

  // Initialize activity array for the last 28 days
  const activity = Array(totalDays).fill(0);
  const now = new Date();

  // Map database dates to index offsets
  scoreHistory.forEach((score) => {
    const completedDate = new Date(score.completedAt);
    const diffTime = Math.abs(now.getTime() - completedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < totalDays) {
      // Index starting from older days to newer days
      const index = (totalDays - 1) - diffDays;
      activity[index] = (activity[index] || 0) + 1;
    }
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-[10px] text-white/30 uppercase font-black tracking-widest px-1">
        <span>Activity History</span>
        <span>Last 28 Days</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5">
        {activity.map((val, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.005 }}
            className={`aspect-square rounded-[4px] cursor-pointer hover:border hover:border-white/20 transition-all ${
              val === 0 ? 'bg-white/5' : 
              val === 1 ? 'bg-neon-cyan/25' : 
              val === 2 ? 'bg-neon-cyan/50 shadow-glow-cyan/20' : 
              'bg-neon-cyan shadow-glow-cyan'
            }`}
            title={`${val} sessions completed`}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Dynamic Flow Chart mapping actual WPM performance speeds
 */
const FlowChart: React.FC<{ history: any[] }> = ({ history }) => {
  // Use last 7 sessions, reversed to make it chronological (left-to-right)
  const recentScores = [...history].slice(0, 7).reverse();
  
  // Safe defaults if fewer than 2 scores exist
  const points = recentScores.length >= 2 
    ? recentScores.map(s => s.wpm) 
    : [30, 45, 35, 55, 40, 60, 50]; // Fallback placeholder line shape

  const maxWPM = Math.max(...points, 80);
  const minWPM = Math.min(...points, 20);
  const range = maxWPM - minWPM || 10;

  // Map scores into 240x100 SVG coordinate box
  const mappedPoints = points.map((val, idx) => {
    const x = idx * (240 / (points.length - 1));
    const y = 85 - ((val - minWPM) / range) * 70; // keeps points between y=15 and y=85
    return { x, y };
  });

  const path = mappedPoints.map(p => `${p.x},${p.y}`).join(' L ');

  return (
    <div className="h-28 w-full mt-4 flex items-center justify-center">
      <svg viewBox="0 0 240 100" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {points.length > 1 && (
          <>
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
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            {mappedPoints.map((p, i) => (
              <g key={i}>
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  fill="#0a0e27"
                  stroke="#00f0ff"
                  strokeWidth="1.5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                />
                <text
                  x={p.x}
                  y={p.y - 8}
                  fill="#00f0ff"
                  fontSize="7"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="opacity-70"
                >
                  {Math.round(points[i])}
                </text>
              </g>
            ))}
          </>
        )}
      </svg>
    </div>
  );
};

export const StatsSection: React.FC<StatsSectionProps> = ({
  scoreHistory = [],
  personalBestWPM = 0,
  gamesPlayed = 0,
  avgAccuracy = 0,
}) => {
  // 1. Calculate user consistency (WPM Standard Deviation equivalent)
  const calculateConsistency = () => {
    if (scoreHistory.length < 2) return 80; // standard default
    const avg = scoreHistory.reduce((acc, curr) => acc + curr.wpm, 0) / scoreHistory.length;
    const variance = scoreHistory.reduce((acc, curr) => acc + Math.pow(curr.wpm - avg, 2), 0) / scoreHistory.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert variation into stability score from 0-100%
    const stability = Math.max(50, Math.min(100, 100 - stdDev * 2));
    return Math.round(stability);
  };

  const consistency = calculateConsistency();

  // 2. Identify peak performance speed
  const peakWPM = personalBestWPM || 0;

  // 3. Determine improvement trend arrow/label
  const getTrend = () => {
    if (scoreHistory.length < 3) return { label: 'Stable', color: 'text-white/40 bg-white/5' };
    const latest = scoreHistory[0].wpm;
    const prev = scoreHistory[1].wpm;
    if (latest > prev + 2) return { label: 'Improving', color: 'text-neon-cyan bg-neon-cyan/10' };
    if (latest < prev - 2) return { label: 'Fatigued', color: 'text-neon-pink bg-neon-pink/10' };
    return { label: 'Stable', color: 'text-neon-gold bg-neon-gold/10' };
  };

  const trend = getTrend();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-black tracking-tight text-white uppercase">Performance Metrics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Consistency Score */}
        <Card glow="violet" className="flex flex-col p-6 bg-dark-card/30 border-white/5 relative overflow-hidden h-full justify-between">
          <div className="relative z-10 flex flex-col items-center justify-center py-2">
            <h3 className="text-sm text-white/40 uppercase font-black tracking-widest mb-6">Timing Consistency</h3>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="54" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/5" />
                <motion.circle 
                  cx="64" cy="64" r="54" fill="none" stroke="currentColor" strokeWidth="6" 
                  className="text-neon-violet"
                  strokeDasharray="339.3"
                  initial={{ strokeDashoffset: 339.3 }}
                  animate={{ strokeDashoffset: 339.3 * (1 - consistency / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white">{consistency}%</span>
                <span className="text-[9px] text-white/30 uppercase font-black">Stability</span>
              </div>
            </div>
            <p className="mt-6 text-xs text-white/50 text-center px-4 leading-relaxed">
              Based on rhythm spacing variance across your last <span className="text-neon-violet font-bold">{scoreHistory.length} matches</span>.
            </p>
          </div>
        </Card>

        {/* Dynamic Typing Flow (Graph showing actual speed history) */}
        <Card glow="cyan" className="flex flex-col p-6 bg-dark-card/30 border-white/5 h-full justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">Typing Flow</h3>
                <p className="text-[10px] text-white/30 uppercase font-bold">Speed Trend</p>
              </div>
              <span className="text-neon-cyan font-black text-xl">
                {consistency > 90 ? 'S+' : consistency > 80 ? 'A+' : 'B'}
              </span>
            </div>
            
            {scoreHistory.length > 0 ? (
              <FlowChart history={scoreHistory} />
            ) : (
              <div className="h-28 flex items-center justify-center text-xs text-white/20 italic">
                No recent matches to display
              </div>
            )}
          </div>
          
          <div className="pt-4 flex justify-between items-end border-t border-white/5 mt-4">
            <div className="flex flex-col">
              <span className="text-xl font-black text-white">{peakWPM}</span>
              <span className="text-[9px] text-white/30 uppercase font-bold">Peak WPM</span>
            </div>
            <div className={`text-[10px] font-black uppercase px-2 py-1 rounded ${trend.color}`}>
              {trend.label}
            </div>
          </div>
        </Card>

        {/* Dynamic Activity Heatmap & Recent Match Logs */}
        <Card glow="none" className="flex flex-col p-6 bg-dark-card/30 border-white/5 h-full justify-between">
          <div>
            <StreakHeatmap scoreHistory={scoreHistory} />
            
            {/* Scrollable match logs list */}
            <div className="mt-4 space-y-2 max-h-32 overflow-y-auto pr-1">
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1.5 px-0.5">Recent Activity</p>
              {scoreHistory.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-white/5 hover:bg-white/10 p-2.5 rounded-xl border border-white/5 text-xs transition-colors">
                  <div className="truncate pr-2">
                    <p className="font-bold text-white truncate leading-tight">{item.songTitle}</p>
                    <p className="text-[9px] text-white/40 truncate">{item.songArtist}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-neon-cyan">{Math.round(item.wpm)} WPM</p>
                    <p className="text-[9px] text-white/40">{Math.round(item.accuracy)}% acc</p>
                  </div>
                </div>
              ))}
              
              {scoreHistory.length === 0 && (
                <div className="text-center py-6 text-xs text-white/20 italic">
                  Complete a typing test to view logs
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-4 border-t border-white/5 pt-4">
            <div className="flex-1 flex items-center justify-between bg-white/5 px-3 py-2 rounded-xl border border-white/5">
              <span className="text-[10px] text-white/40 uppercase font-bold">Games</span>
              <span className="text-xs font-black text-neon-gold">{gamesPlayed}</span>
            </div>
            <div className="flex-1 flex items-center justify-between bg-white/5 px-3 py-2 rounded-xl border border-white/5">
              <span className="text-[10px] text-white/40 uppercase font-bold">Accuracy</span>
              <span className="text-xs font-black text-neon-pink">{avgAccuracy.toFixed(1)}%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

