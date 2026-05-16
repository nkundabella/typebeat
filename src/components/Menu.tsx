import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './UI';
import { HeroBanner } from './HeroBanner';
import { getAllSongs } from '@/data/songs';
import { TrackGrid } from './TrackGrid';
import { StatsSection } from './StatsSection';

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
      className="space-y-12 pb-24"
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

      {/* Advanced Performance Stats */}
      <StatsSection />
    </motion.div>
  );
};
