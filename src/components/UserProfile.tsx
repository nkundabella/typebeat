import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, ProgressBar, Badge } from './UI';

interface UserProfileProps {
  currentUsername: string;
  currentAvatarSeed: string;
  onProfileUpdated: (username: string, avatarSeed: string) => void;
  onNavigateBack: () => void;
}

const PRESET_SEEDS = [
  'Felix', 'Aneka', 'Jack', 'Midnight', 'Rhythm', 
  'Tempo', 'Beat', 'Pixel', 'Spike', 'Shadow', 
  'Laser', 'Chrono', 'Buster', 'Coco', 'Sassy'
];

export const UserProfile: React.FC<UserProfileProps> = ({
  currentUsername,
  currentAvatarSeed,
  onProfileUpdated,
  onNavigateBack,
}) => {
  const [username, setUsername] = useState(currentUsername);
  const [avatarSeed, setAvatarSeed] = useState(currentAvatarSeed);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Scoring / stats state
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    totalGamesPlayed: 0,
    personalBestWPM: 0,
    averageAccuracy: 0,
    totalScore: 0,
  });
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/scores/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setHistory(data.history);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      showFeedback('error', 'Username cannot be empty.');
      return;
    }
    
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, avatarSeed }),
      });

      if (res.ok) {
        const data = await res.json();
        onProfileUpdated(data.profile.username, data.profile.avatarSeed);
        showFeedback('success', 'Profile updated successfully!');
      } else {
        const errorData = await res.json();
        showFeedback('error', errorData.error || 'Failed to update profile.');
      }
    } catch (err) {
      showFeedback('error', 'Network error. Could not connect to backend.');
    } finally {
      setIsSaving(false);
    }
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const handleRandomizeAvatar = () => {
    const randomPreset = PRESET_SEEDS[Math.floor(Math.random() * PRESET_SEEDS.length)];
    const randomSuffix = Math.floor(Math.random() * 100);
    setAvatarSeed(`${randomPreset}${randomSuffix}`);
  };

  const handleDeleteScore = async (scoreId: number) => {
    if (!window.confirm('Are you sure you want to delete this score record?')) {
      return;
    }

    try {
      const res = await fetch(`/api/scores/${scoreId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showFeedback('success', 'Score record deleted successfully.');
        fetchStats();
      } else {
        showFeedback('error', 'Failed to delete score record.');
      }
    } catch (err) {
      showFeedback('error', 'Network error. Could not delete score.');
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('WARNING: This will permanently delete your entire match history! Are you sure?')) {
      return;
    }

    try {
      const res = await fetch('/api/scores', {
        method: 'DELETE',
      });
      if (res.ok) {
        showFeedback('success', 'Score history cleared.');
        fetchStats();
      } else {
        showFeedback('error', 'Failed to clear score history.');
      }
    } catch (err) {
      showFeedback('error', 'Network error. Could not clear history.');
    }
  };

  // Level Calculations
  const xpPerLevel = 1000;
  const currentLevel = Math.floor(stats.totalScore / xpPerLevel) + 1;
  const currentXP = stats.totalScore % xpPerLevel;
  const progressPercent = (currentXP / xpPerLevel) * 100;

  // Ranks depending on level
  const getRank = (level: number) => {
    if (level >= 20) return 'Rhythm Overlord';
    if (level >= 15) return 'Typing Virtuoso';
    if (level >= 10) return 'Speed Maestro';
    if (level >= 5) return 'Keyboard Enthusiast';
    return 'Beat Cadet';
  };

  // Achievements Configuration
  const achievements = [
    {
      id: 'rookie',
      title: 'Rhythm Rookie',
      desc: 'Complete your first typed track.',
      unlocked: stats.totalGamesPlayed >= 1,
      badgeColor: 'cyan' as const,
    },
    {
      id: 'speed_demon',
      title: 'Speed Demon',
      desc: 'Achieve a speed of 80+ WPM.',
      unlocked: stats.personalBestWPM >= 80,
      badgeColor: 'violet' as const,
    },
    {
      id: 'flawless',
      title: 'Perfect Accuracy',
      desc: 'Maintain average accuracy above 95%.',
      unlocked: stats.averageAccuracy >= 95 && stats.totalGamesPlayed >= 3,
      badgeColor: 'pink' as const,
    },
    {
      id: 'tempo_master',
      title: 'Tempo Master',
      desc: 'Play 15 or more tracks.',
      unlocked: stats.totalGamesPlayed >= 15,
      badgeColor: 'gold' as const,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-8 pb-24 text-white"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight font-display">User Profile</h1>
          <p className="text-sm text-white/50 uppercase tracking-widest font-black mt-1">Configure Beat Cadet Settings</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onNavigateBack}>
          &larr; Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Customizer Card */}
        <div className="lg:col-span-5 space-y-6">
          <Card glow="violet" className="space-y-6">
            <h3 className="text-lg font-black uppercase tracking-wide border-b border-white/10 pb-3 flex items-center justify-between">
              <span>Customize Profile</span>
              <span className="text-xs text-neon-violet font-bold uppercase">Settings</span>
            </h3>

            {/* Avatar Preview */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-dark-bg border-2 border-neon-violet/50 shadow-glow-violet/20 flex items-center justify-center p-2">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                  alt="User Avatar"
                  className="w-full h-full object-contain"
                />
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={handleRandomizeAvatar} className="w-full">
                ✨ Randomize Avatar
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest px-0.5">Avatar Seed</label>
                <input
                  type="text"
                  value={avatarSeed}
                  onChange={(e) => setAvatarSeed(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-neon-violet transition-colors text-white"
                  placeholder="Enter seed phrase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest px-0.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-neon-cyan transition-colors text-white"
                  placeholder="Enter username"
                />
              </div>

              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg text-xs font-semibold ${
                    feedback.type === 'success' ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/25' : 'bg-neon-pink/15 text-neon-pink border border-neon-pink/25'
                  }`}
                >
                  {feedback.message}
                </motion.div>
              )}

              <Button type="submit" variant="primary" className="w-full mt-2" disabled={isSaving}>
                {isSaving ? 'Saving Changes...' : 'Save Settings'}
              </Button>
            </form>
          </Card>

          {/* Settings Actions Card */}
          <Card glow="none" className="bg-dark-card/25 border-white/5 p-5 space-y-4">
            <h4 className="text-xs text-white/40 uppercase font-black tracking-widest px-0.5">Danger Zone</h4>
            <Button variant="danger" size="sm" onClick={handleClearHistory} className="w-full">
              🚨 Clear Match History
            </Button>
          </Card>
        </div>

        {/* Right Side: Achievements & Advanced Progress */}
        <div className="lg:col-span-7 space-y-8">
          {/* Level progress */}
          <Card glow="gold" className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] text-white/30 uppercase font-bold">Current Rank</p>
                <h3 className="text-2xl font-black text-neon-gold uppercase font-display leading-tight">{getRank(currentLevel)}</h3>
              </div>
              <div className="text-right">
                <span className="text-sm text-white/40 uppercase font-black">Level </span>
                <span className="text-4xl font-black text-white">{currentLevel}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-white/50">
                <span>XP Progress</span>
                <span>{currentXP} / {xpPerLevel} XP</span>
              </div>
              <ProgressBar current={currentXP} total={xpPerLevel} color="gold" />
              <p className="text-[10px] text-white/30 uppercase font-bold pt-1">
                Accumulate XP by scoring points in typing runs. 1,000 XP = 1 Level.
              </p>
            </div>
          </Card>

          {/* Achievements Grid */}
          <Card glow="cyan" className="space-y-6">
            <h3 className="text-lg font-black uppercase tracking-wide border-b border-white/10 pb-3 flex items-center justify-between">
              <span>Achievements Badges</span>
              <span className="text-xs text-neon-cyan font-bold uppercase">Unlocks</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    ach.unlocked
                      ? 'bg-white/5 border-white/10 hover:border-white/20'
                      : 'bg-black/20 border-white/5 opacity-55'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                        {ach.title}
                        {ach.unlocked && <span className="text-neon-cyan text-xs">✓</span>}
                      </h4>
                      <p className="text-xs text-white/40 mt-1 leading-normal">{ach.desc}</p>
                    </div>
                    <Badge
                      label={ach.unlocked ? 'Unlocked' : 'Locked'}
                      color={ach.unlocked ? ach.badgeColor : 'violet'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Area: Full Match History logs */}
      <Card glow="none" className="bg-dark-card/30 border-white/5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">Full Match History</h3>
            <p className="text-[10px] text-white/30 uppercase font-bold">Database Records ({history.length} total runs)</p>
          </div>
          {history.length > 0 && (
            <Button variant="danger" size="sm" onClick={handleClearHistory}>
              Clear History
            </Button>
          )}
        </div>

        {isLoadingStats ? (
          <div className="text-center py-12 text-sm text-white/40 italic">
            Retrieving typing logs...
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-sm text-white/30 italic">
            You haven't completed any typing runs yet. Select a song and start typing!
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-white/40 uppercase tracking-widest text-[9px] font-black">
                  <th className="pb-3 pl-2">Song Details</th>
                  <th className="pb-3">Speed (WPM)</th>
                  <th className="pb-3">Accuracy</th>
                  <th className="pb-3">Score Points</th>
                  <th className="pb-3">Date Completed</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3.5 pl-2 flex items-center gap-3">
                      {row.coverArt ? (
                        <img src={row.coverArt} alt="cover" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center flex-shrink-0 text-white/20">🎵</div>
                      )}
                      <div>
                        <p className="font-bold text-white leading-normal">{row.songTitle || 'Unknown Track'}</p>
                        <p className="text-[10px] text-white/40">{row.songArtist || 'Unknown Artist'}</p>
                      </div>
                    </td>
                    <td className="py-3.5 font-bold text-neon-cyan">{Math.round(row.wpm * 10) / 10}</td>
                    <td className="py-3.5 font-bold text-neon-pink">{Math.round(row.accuracy * 10) / 10}%</td>
                    <td className="py-3.5 font-black text-neon-gold">{row.score}</td>
                    <td className="py-3.5 text-white/50">{new Date(row.completedAt).toLocaleString()}</td>
                    <td className="py-3.5 pr-2 text-right">
                      <button
                        onClick={() => handleDeleteScore(row.id)}
                        className="text-white/20 hover:text-neon-pink p-1.5 rounded-lg hover:bg-neon-pink/10 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Run"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
