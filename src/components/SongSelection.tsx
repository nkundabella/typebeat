import React from 'react';
import { motion } from 'framer-motion';
import { Button, Card, Badge } from './UI';
import type { Song } from '@/types';

interface SongCardProps {
  song: Song;
  onSelect: (song: Song) => void;
  personalBestWPM: number;
}

/**
 * Individual song card for selection screen
 */
export const SongCard: React.FC<SongCardProps> = ({
  song,
  onSelect,
  personalBestWPM,
}) => {
  const isUnlocked =
    !song.requiredWPM || personalBestWPM >= song.requiredWPM;

  return (
    <Card glow="violet" className="cursor-pointer hover:border-neon-cyan/60">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-display text-xl font-bold text-neon-cyan">
            {song.title}
          </h3>
          <p className="text-neon-violet/70 text-sm">{song.artist}</p>
        </div>
        <Badge label={song.genre} color="gold" />
      </div>

      <p className="text-white/70 text-sm line-clamp-2 mb-4">{song.lyrics}</p>

      <div className="flex justify-between items-center mb-4">
        <span className="text-neon-cyan/60 text-xs">
          ⏱ {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
        </span>
        {song.requiredWPM && (
          <span className="text-neon-gold text-xs">
            🎯 {song.requiredWPM} WPM required
          </span>
        )}
      </div>

      <motion.div
        whileHover={isUnlocked ? { scale: 1.02 } : {}}
        whileTap={isUnlocked ? { scale: 0.98 } : {}}
      >
        <Button
          onClick={() => isUnlocked && onSelect(song)}
          disabled={!isUnlocked}
          variant={isUnlocked ? 'primary' : 'secondary'}
          className="w-full"
        >
          {isUnlocked ? 'Select Song' : `🔒 Locked - ${song.requiredWPM} WPM`}
        </Button>
      </motion.div>
    </Card>
  );
};

interface SongSelectionScreenProps {
  songs: Song[];
  personalBestWPM: number;
  onSelectSong: (song: Song) => void;
  onBack: () => void;
}

/**
 * Song selection screen component
 */
export const SongSelectionScreen: React.FC<SongSelectionScreenProps> = ({
  songs,
  personalBestWPM,
  onSelectSong,
  onBack,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <p className="text-neon-cyan text-lg">
          Personal Best: <span className="font-bold text-neon-gold">{personalBestWPM} WPM</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            onSelect={onSelectSong}
            personalBestWPM={personalBestWPM}
          />
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="secondary" onClick={onBack}>
          ← Back to Menu
        </Button>
      </div>
    </motion.div>
  );
};
