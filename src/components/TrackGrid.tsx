import React from 'react';
import { motion } from 'framer-motion';
import { Song, Difficulty } from '@/types';

interface TrackCardProps {
  song: Song;
  onPlay: (song: Song) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({ song, onPlay }) => {
  const difficultyColors = {
    [Difficulty.BEGINNER]: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30',
    [Difficulty.INTERMEDIATE]: 'bg-neon-violet/20 text-neon-violet border-neon-violet/30',
    [Difficulty.ADVANCED]: 'bg-neon-pink/20 text-neon-pink border-neon-pink/30',
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative flex flex-col bg-dark-card/40 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-md hover:bg-white/5 transition-all duration-300"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={song.coverArt} 
          alt={song.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-80" />
        
        {/* Difficulty Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${difficultyColors[song.difficulty]}`}>
            {song.difficulty}
          </span>
        </div>

        {/* Lock Overlay */}
        {song.locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-bg/80 backdrop-blur-[2px]">
            <span className="text-3xl mb-2">🔒</span>
            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Requires {song.requiredWPM} WPM</span>
          </div>
        )}

        {/* Play Button Overlay */}
        {!song.locked && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onPlay(song)}
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-neon-cyan shadow-glow-cyan flex items-center justify-center text-dark-bg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
          >
            <span className="text-xl ml-1">▶</span>
          </motion.button>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white leading-tight mb-1 group-hover:text-neon-cyan transition-colors">{song.title}</h3>
            <p className="text-white/40 text-sm">{song.artist}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-neon-gold font-black text-lg leading-none">{song.bpm}</span>
            <span className="text-[10px] text-white/20 uppercase font-bold">BPM</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm">{(song.requiredWPM || 30)} - {(song.requiredWPM || 30) + 20}</span>
              <span className="text-[10px] text-white/30 uppercase font-bold">Target WPM</span>
            </div>
          </div>
          <div className="text-xs text-white/50 font-medium">
            {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface TrackGridProps {
  title: string;
  songs: Song[];
  onPlaySong: (song: Song) => void;
}

export const TrackGrid: React.FC<TrackGridProps> = ({ title, songs, onPlaySong }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-black tracking-tight text-white uppercase">{title}</h2>
        <button className="text-neon-cyan text-sm font-bold hover:underline">View All</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.map((song) => (
          <TrackCard key={song.id} song={song} onPlay={onPlaySong} />
        ))}
      </div>
    </div>
  );
};
