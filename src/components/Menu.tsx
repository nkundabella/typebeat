import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './UI';
import { HeroBanner } from './HeroBanner';
import { getAllSongs } from '@/data/songs';
import { TrackGrid } from './TrackGrid';

interface MenuScreenProps {
  onPlayClick: () => void;
  onSelectSong?: (song: any) => void;
  personalBestWPM: number;
  gamesPlayed: number;
}

/**
 * Main menu screen
 */
export const MenuScreen: React.FC<MenuScreenProps> = ({
  onPlayClick,
  onSelectSong,
  personalBestWPM,
  gamesPlayed,
}) => {
  const songs = getAllSongs();
  const trendingSongs = songs.slice(0, 3); // Just show top 3 for trending

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-12 pb-12"
    >
      {/* Hero Banner Section */}
      <HeroBanner onSelectMode={(modeId) => {
        if (modeId === 'beat' || modeId === 'speed') {
          onPlayClick();
        }
      }} />

      {/* Trending Tracks Section */}
      <TrackGrid 
        title="Trending Tracks" 
        songs={trendingSongs} 
        onPlaySong={(song) => {
          if (onSelectSong) {
            onSelectSong(song);
          } else {
            onPlayClick();
          }
        }} 
      />

      {/* Lifetime Statistics */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black tracking-tight text-white uppercase px-2">Lifetime Progress</h2>
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
      </div>
    </motion.div>
  );
};
