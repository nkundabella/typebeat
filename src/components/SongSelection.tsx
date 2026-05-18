import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <Card glow="violet" className="cursor-pointer hover:border-neon-cyan/60 flex flex-col h-full justify-between">
      <div>
        <div className="flex justify-between items-start mb-4 gap-3">
          <div className="flex items-center">
            {song.coverArt && (
              <img 
                src={song.coverArt} 
                alt={song.title} 
                className="w-12 h-12 rounded-lg object-cover mr-3 border border-white/10 flex-shrink-0"
              />
            )}
            <div>
              <h3 className="font-display text-lg font-bold text-neon-cyan leading-tight">
                {song.title}
              </h3>
              <p className="text-neon-violet/70 text-xs mt-0.5">{song.artist}</p>
            </div>
          </div>
          <Badge label={song.genre} color="gold" />
        </div>

        <p className="text-white/60 text-xs line-clamp-3 mb-4 italic">
          "{song.lyrics.split('\n').slice(0, 2).join(' / ')}..."
        </p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-neon-cyan/60 text-xs">
            ⏱ {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
          </span>
          {song.requiredWPM ? (
            <span className="text-neon-gold text-xs font-bold">
              🎯 {song.requiredWPM} WPM required
            </span>
          ) : (
            <span className="text-neon-cyan/60 text-xs">
              ⚡ Unlocked
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
            className="w-full text-xs py-2.5"
          >
            {isUnlocked ? 'Select Song' : `🔒 Locked - ${song.requiredWPM} WPM`}
          </Button>
        </motion.div>
      </div>
    </Card>
  );
};

interface SongSelectionScreenProps {
  songs: Song[];
  personalBestWPM: number;
  onSelectSong: (song: Song) => void;
  onSongImported: (song: Song) => void;
  onBack: () => void;
}

interface ExternalTrack {
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number;
  audioUrl: string;
  coverArt: string;
}

/**
 * Song selection screen component with online searching and importing capabilities
 */
export const SongSelectionScreen: React.FC<SongSelectionScreenProps> = ({
  songs,
  personalBestWPM,
  onSelectSong,
  onSongImported,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'playlist' | 'search'>('playlist');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ExternalTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [importingUrl, setImportingUrl] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Search online songs via Express backend
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const response = await fetch(`http://localhost:5000/api/songs/search-external?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve search results.');
      }
      const data = await response.json();
      setSearchResults(data);
      if (data.length === 0) {
        setSearchError('No songs with preview clips found. Try a different search term!');
      }
    } catch (err: any) {
      console.error(err);
      setSearchError('Could not connect to backend server. Make sure the backend is running.');
    } finally {
      setSearching(false);
    }
  };

  // Import track (lyric fetching + DB save)
  const handleImport = async (track: ExternalTrack) => {
    setImportingUrl(track.audioUrl);
    setImportError(null);

    try {
      const response = await fetch('http://localhost:5000/api/songs/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(track),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to import this song.');
      }

      // Success! Notify parent component of the new playable song
      onSongImported(data.song);
    } catch (err: any) {
      console.error(err);
      setImportError(err.message || 'Failed to fetch lyrics for this song. Choose another track!');
    } finally {
      setImportingUrl(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 max-w-6xl mx-auto"
    >
      {/* Header Profile Stats */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-dark-card/20 border border-white/5 rounded-2xl p-6 backdrop-blur-md gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white uppercase tracking-tight">Select Your Rhythm</h2>
          <p className="text-white/40 text-sm mt-1">Type in sync with the beat to unlock absolute accuracy.</p>
        </div>
        <div className="bg-neon-gold/10 border border-neon-gold/30 rounded-xl px-5 py-2.5 text-center">
          <p className="text-neon-gold/70 text-xs uppercase tracking-wider font-bold">Personal Best</p>
          <p className="font-display text-2xl font-black text-neon-gold">{personalBestWPM} <span className="text-xs">WPM</span></p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => setActiveTab('playlist')}
          className={`pb-4 px-2 font-display font-bold text-sm tracking-widest uppercase transition-all relative ${
            activeTab === 'playlist' ? 'text-neon-cyan' : 'text-white/40 hover:text-white/70'
          }`}
        >
          My Playlist ({songs.length})
          {activeTab === 'playlist' && (
            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan shadow-glow-cyan" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`pb-4 px-2 font-display font-bold text-sm tracking-widest uppercase transition-all relative ${
            activeTab === 'search' ? 'text-neon-pink' : 'text-white/40 hover:text-white/70'
          }`}
        >
          🔍 Search Online
          {activeTab === 'search' && (
            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-pink shadow-glow-pink" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        {activeTab === 'playlist' ? (
          <motion.div
            key="playlist-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onSelect={onSelectSong}
                personalBestWPM={personalBestWPM}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="search-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-4 max-w-2xl">
              <input
                type="text"
                placeholder="Search by song name or artist (e.g. 'Abba', 'Starboy')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow px-5 py-3.5 rounded-xl bg-dark-card/40 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-pink/70 transition-all text-sm backdrop-blur-sm"
              />
              <button
                type="submit"
                disabled={searching}
                className="px-6 py-3.5 bg-gradient-to-r from-neon-pink to-neon-violet hover:shadow-glow-pink disabled:opacity-50 text-dark-bg font-display font-bold rounded-xl transition-all text-sm flex-shrink-0"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {/* Error alerts */}
            {searchError && (
              <Card glow="pink" className="bg-neon-pink/5 border border-neon-pink/20 py-4 px-6 text-sm text-neon-pink flex items-center">
                <span>⚠️ {searchError}</span>
              </Card>
            )}

            {importError && (
              <Card glow="pink" className="bg-neon-pink/5 border border-neon-pink/20 py-4 px-6 text-sm text-neon-pink flex items-center justify-between">
                <span>❌ {importError}</span>
                <button onClick={() => setImportError(null)} className="text-white/40 hover:text-white">✕</button>
              </Card>
            )}

            {/* Online Search Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((track) => {
                const isImporting = importingUrl === track.audioUrl;
                return (
                  <Card key={track.audioUrl} glow="none" className="bg-dark-card/30 border border-white/5 p-4 flex items-center justify-between hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-4 min-w-0 pr-4">
                      <img 
                        src={track.coverArt} 
                        alt={track.title} 
                        className="w-16 h-16 rounded-lg object-cover border border-white/10 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-display font-bold text-white text-base truncate leading-snug">
                          {track.title}
                        </h4>
                        <p className="text-white/50 text-xs truncate mt-0.5">{track.artist}</p>
                        <div className="flex gap-2 mt-1.5 items-center">
                          <span className="text-[10px] bg-white/5 text-white/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {track.genre}
                          </span>
                          <span className="text-[10px] text-white/30">
                            ⏱ {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-shrink-0">
                      <Button
                        onClick={() => handleImport(track)}
                        disabled={importingUrl !== null}
                        variant="primary"
                        className="px-4 py-2.5 text-xs bg-gradient-to-r from-neon-cyan to-neon-violet text-dark-bg font-display font-bold shadow-glow-cyan border-none rounded-xl"
                      >
                        {isImporting ? (
                          <div className="flex items-center gap-2">
                            <span className="animate-spin text-sm">⏳</span> Importing...
                          </div>
                        ) : (
                          'Import & Play'
                        )}
                      </Button>
                    </motion.div>
                  </Card>
                );
              })}
            </div>

            {!searching && searchResults.length === 0 && !searchError && (
              <div className="text-center py-12 bg-dark-card/10 border border-dashed border-white/10 rounded-2xl">
                <span className="text-4xl">🎵</span>
                <h4 className="font-display font-bold text-white/50 mt-4 text-sm">Discover and add any track in the world</h4>
                <p className="text-white/30 text-xs mt-1">Search above to fetch its lyrics and high-quality preview instantly.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button */}
      <div className="flex justify-center pt-4">
        <Button variant="secondary" onClick={onBack} className="text-xs">
          ← Back to Menu
        </Button>
      </div>
    </motion.div>
  );
};

