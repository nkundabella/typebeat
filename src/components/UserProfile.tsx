import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button, Input, Badge, ProgressBar } from './UI';
import { GameResult } from '../types'; // adjust path if needed

/**
 * UserProfile – displays and edits the single active user's profile.
 * Matches the application's neon glassmorphism style.
 */
const UserProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState({
    totalGamesPlayed: 0,
    personalBestWPM: 0,
    averageAccuracy: 0,
    unlockedSongs: [] as string[],
    achievements: [] as string[],
    gameHistory: [] as GameResult[],
  });

  // Helper to fetch profile + stats (combined endpoint could be added later – for now we pull from two sources)
  const fetchData = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        axios.get('/api/profile'),
        axios.get('/api/scores'), // reusing scores endpoint for aggregates
      ]);

      const { username, avatarSeed } = profileRes.data;
      setUsername(username);
      setAvatarSeed(avatarSeed);

      const { totalGamesPlayed, personalBestWPM, averageAccuracy, unlockedSongs, achievements, gameHistory } = statsRes.data;
      setStats({
        totalGamesPlayed,
        personalBestWPM,
        averageAccuracy,
        unlockedSongs,
        achievements,
        gameHistory,
      });
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      await axios.put('/api/profile', { username, avatarSeed });
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  const handleDeleteScore = async (id: number) => {
    try {
      await axios.delete(`/api/scores/${id}`);
      // Refresh history after deletion
      const updated = await axios.get('/api/scores');
      setStats(prev => ({ ...prev, gameHistory: updated.data.gameHistory }));
    } catch (err) {
      console.error('Failed to delete score', err);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-white/50">Loading profile…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <Card glow="cyan" className="flex items-center gap-6 p-8">
        <img
          src={`https://api.dicebear.com/6.x/pixel-art/svg?seed=${avatarSeed}`}
          alt="Avatar"
          className="w-24 h-24 rounded-full shadow-glow-cyan"
        />
        <div className="flex-1">
          {editing ? (
            <div className="flex flex-col gap-3">
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                className="bg-dark-card text-white"
              />
              <Input
                value={avatarSeed}
                onChange={e => setAvatarSeed(e.target.value)}
                placeholder="Avatar seed"
                className="bg-dark-card text-white"
              />
              <div className="flex gap-3 mt-2">
                <Button size="sm" onClick={handleSave}>Save</Button>
                <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">{username}</h2>
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Progress & Metrics */}
      <Card glow="violet" className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div className="space-y-3">
          <h3 className="text-sm text-white/40 uppercase font-black">Games Played</h3>
          <p className="text-3xl font-black text-neon-gold">{stats.totalGamesPlayed}</p>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm text-white/40 uppercase font-black">Personal Best</h3>
          <p className="text-3xl font-black text-neon-cyan">{stats.personalBestWPM} WPM</p>
        </div>
        <div className="space-y-3 md:col-span-2">
          <h3 className="text-sm text-white/40 uppercase font-black">Average Accuracy</h3>
          <ProgressBar current={stats.averageAccuracy} total={100} color="pink" />
          <p className="text-xs text-white/60 mt-1">{stats.averageAccuracy.toFixed(1)}%</p>
        </div>
      </Card>

      {/* Achievements */}
      <Card glow="gold" className="p-6 space-y-4">
        <h3 className="text-sm text-white/40 uppercase font-black">Achievements</h3>
        <div className="flex flex-wrap gap-2">
          {stats.achievements.length > 0 ? (
            stats.achievements.map((a, i) => (
              <Badge key={i} label={a} color="gold" />
            ))
          ) : (
            <span className="text-white/30 text-sm">No achievements yet.</span>
          )}
        </div>
      </Card>

      {/* Recent Match History */}
      <Card glow="none" className="p-6 space-y-4">
        <h3 className="text-sm text-white/40 uppercase font-black">Recent Matches</h3>
        {stats.gameHistory.length > 0 ? (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {stats.gameHistory.slice(0, 5).map((match) => (
              <li
                key={match.id}
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5"
              >
                <div>
                  <p className="font-bold text-white">{match.songId}</p>
                  <p className="text-xs text-white/40">{new Date(match.completedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-neon-cyan">{Math.round(match.stats.wpm)} WPM</p>
                  <p className="text-xs text-white/40">{match.stats.accuracy.toFixed(1)}% acc</p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteScore(match.id)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/30">No recent matches.</p>
        )}
      </Card>
    </div>
  );
};

export default UserProfile;
