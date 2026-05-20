import React, { useState, useEffect } from 'react';
import { MenuScreen } from './Menu';
import { SongSelectionScreen } from './SongSelection';
import { TypingGame } from './TypingGame';
import { GameResults } from './GameResults';
import { Layout } from './Layout';
import { DashboardLayout } from './DashboardLayout';
import { Sidebar } from './Sidebar';
import { GameState } from '@/types';
import type { Song } from '@/types';
import { SAMPLE_SONGS } from '@/data/songs';
import { UserProfile } from './UserProfile'; // new import
import { motion, AnimatePresence } from 'framer-motion'; // added imports

// variants for page transitions
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 },
};
const pageTransition = { duration: 0.4, ease: 'easeInOut' };

/**
 * Main App component - handles overall game state and navigation
 */
export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [personalBestWPM, setPersonalBestWPM] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [lastGameStats, setLastGameStats] = useState<GameStats | null>(null);
  const [avgAccuracy, setAvgAccuracy] = useState(0);
  const [streak, setStreak] = useState(0);

  const [songs, setSongs] = useState<Song[]>([]);
  const [scoreHistory, setScoreHistory] = useState<any[]>([]);

  // Load songs and stats on mount
  useEffect(() => {
    fetchSongs();
    fetchStats();
  }, []);

  const fetchSongs = async () => {
    try {
      const res = await fetch('/api/songs');
      if (!res.ok) throw new Error('Failed to fetch songs from backend.');
      const data = await res.json();
      setSongs(data);
    } catch (err) {
      console.warn('Backend offline, using local starter songs fallback.');
      setSongs(SAMPLE_SONGS);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/scores/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();

      if (data.stats) {
        setGamesPlayed(data.stats.totalGamesPlayed);
        setPersonalBestWPM(data.stats.personalBestWPM);
        setAvgAccuracy(data.stats.averageAccuracy);
      }
      if (data.history) {
        setScoreHistory(data.history);
      }
    } catch (err) {
      console.warn('Backend offline, running with local session statistics.');
    }
  };

  // Navigation handlers
  const handlePlayClick = () => setGameState(GameState.SONG_SELECT);

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    setGameState(GameState.PLAYING);
  };

  const handleSongImported = (newSong: Song) => {
    setSongs((prev) => [newSong, ...prev]);
    setSelectedSong(newSong);
    setGameState(GameState.PLAYING);
  };

  const handleGameComplete = async (stats: GameStats) => {
    setLastGameStats(stats);
    setGamesPlayed((prev) => prev + 1);
    setAvgAccuracy((prev) => {
      if (gamesPlayed === 0) return stats.accuracy;
      return (prev * gamesPlayed + stats.accuracy) / (gamesPlayed + 1);
    });

    if (stats.accuracy > 90) setStreak((prev) => prev + 1);
    else setStreak(0);

    if (stats.wpm > personalBestWPM) setPersonalBestWPM(stats.wpm);

    // Submit score to backend
    if (selectedSong) {
      const calculatedScore = Math.round(stats.wpm * 10 * (stats.accuracy / 100));
      try {
        console.log(`Submitting score to PostgreSQL: ${calculatedScore}`);
        const res = await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            songId: selectedSong.id,
            wpm: stats.wpm,
            accuracy: stats.accuracy,
            score: calculatedScore,
          }),
        });
        if (res.ok) fetchStats();
      } catch (err) {
        console.warn('Failed to persist score to backend database. Session will remain locally active.', err);
      }
    }

    setGameState(GameState.FINISHED);
  };

  const handlePlayAgain = () => {
    if (selectedSong) setGameState(GameState.PLAYING);
  };

  const handleSelectDifferent = () => setGameState(GameState.SONG_SELECT);

  const handleBackToMenu = () => {
    setGameState(GameState.MENU);
    setSelectedSong(null);
  };

  const handleNavigate = (state: GameState) => setGameState(state);

  const sidebar = (
    <Sidebar
      userStats={{
        wpm: personalBestWPM || 0,
        accuracy: avgAccuracy || 0,
        level: Math.floor(gamesPlayed / 5) + 1,
        rank: gamesPlayed > 20 ? 'Tempo Master' : gamesPlayed > 10 ? 'Rhythm Pro' : 'Rhythm Rookie',
        streak,
      }}
      onNavigate={handleNavigate}
    />
  );

  return (
    <DashboardLayout sidebar={sidebar}>
      <AnimatePresence exitBeforeEnter>
        {gameState === GameState.PLAYING && selectedSong && (
          <motion.div
            key="playing"
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={pageTransition}
          >
            <Layout>
              <TypingGame
                lyrics={selectedSong.lyrics}
                songTitle={selectedSong.title}
                artist={selectedSong.artist}
                audioUrl={selectedSong.audioUrl}
                syncedLyrics={selectedSong.syncedLyrics}
                onComplete={handleGameComplete}
                onBack={handleBackToMenu}
              />
            </Layout>
          </motion.div>
        )}

        {gameState === GameState.MENU && (
          <motion.div
            key="menu"
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={pageTransition}
          >
            <MenuScreen
              onPlayClick={handlePlayClick}
              onSelectSong={handleSelectSong}
              personalBestWPM={personalBestWPM}
              gamesPlayed={gamesPlayed}
              scoreHistory={scoreHistory}
              avgAccuracy={avgAccuracy}
            />
          </motion.div>
        )}

        {gameState === GameState.SONG_SELECT && (
          <motion.div
            key="songselect"
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={pageTransition}
          >
            <SongSelectionScreen
              songs={songs}
              personalBestWPM={personalBestWPM}
              onSelectSong={handleSelectSong}
              onSongImported={handleSongImported}
              onBack={handleBackToMenu}
            />
          </motion.div>
        )}

        {gameState === GameState.FINISHED && selectedSong && lastGameStats && (
          <motion.div
            key="finished"
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={pageTransition}
          >
            <GameResults
              songTitle={selectedSong.title}
              artist={selectedSong.artist}
              stats={lastGameStats}
              onPlayAgain={handlePlayAgain}
              onSelectDifferent={handleSelectDifferent}
              onBackToMenu={handleBackToMenu}
            />
          </motion.div>
        )}

        {gameState === GameState.PROFILE && (
          <motion.div
            key="profile"
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={pageTransition}
          >
            <UserProfile />
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

interface GameStats {
  totalChars: number;
  correctChars: number;
  elapsedTime: number;
  wpm: number;
  accuracy: number;
}

/**
 * Main App component - handles overall game state and navigation
 */
export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [personalBestWPM, setPersonalBestWPM] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [lastGameStats, setLastGameStats] = useState<GameStats | null>(null);
  const [avgAccuracy, setAvgAccuracy] = useState(0);
  const [streak, setStreak] = useState(0);

  const [songs, setSongs] = useState<Song[]>([]);
  const [scoreHistory, setScoreHistory] = useState<any[]>([]);

  // Load songs and stats on mount
  useEffect(() => {
    fetchSongs();
    fetchStats();
  }, []);

  const fetchSongs = async () => {
    try {
      const res = await fetch('/api/songs');
      if (!res.ok) throw new Error('Failed to fetch songs from backend.');
      const data = await res.json();
      setSongs(data);
    } catch (err) {
      console.warn('Backend offline, using local starter songs fallback.');
      setSongs(SAMPLE_SONGS);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/scores/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      
      if (data.stats) {
        setGamesPlayed(data.stats.totalGamesPlayed);
        setPersonalBestWPM(data.stats.personalBestWPM);
        setAvgAccuracy(data.stats.averageAccuracy);
      }
      if (data.history) {
        setScoreHistory(data.history);
      }
    } catch (err) {
      console.warn('Backend offline, running with local session statistics.');
    }
  };

  // Navigation handlers
  const handlePlayClick = () => {
    setGameState(GameState.SONG_SELECT);
  };

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    setGameState(GameState.PLAYING);
  };

  const handleSongImported = (newSong: Song) => {
    // Add new song to local state
    setSongs((prev) => [newSong, ...prev]);
    // Automatically select it and transition to the Typing Game
    setSelectedSong(newSong);
    setGameState(GameState.PLAYING);
  };

  const handleGameComplete = async (stats: GameStats) => {
    setLastGameStats(stats);
    
    // Local state fallback updates
    setGamesPlayed((prev) => prev + 1);
    setAvgAccuracy((prev) => {
      if (gamesPlayed === 0) return stats.accuracy;
      return (prev * gamesPlayed + stats.accuracy) / (gamesPlayed + 1);
    });

    if (stats.accuracy > 90) {
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    if (stats.wpm > personalBestWPM) {
      setPersonalBestWPM(stats.wpm);
    }

    // Submit score to PostgreSQL backend
    if (selectedSong) {
      const calculatedScore = Math.round(stats.wpm * 10 * (stats.accuracy / 100));
      
      try {
        console.log(`Submitting score to PostgreSQL: ${calculatedScore}`);
        const res = await fetch('/api/scores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            songId: selectedSong.id,
            wpm: stats.wpm,
            accuracy: stats.accuracy,
            score: calculatedScore
          }),
        });

        if (res.ok) {
          // Refresh aggregates and history from database
          fetchStats();
        }
      } catch (err) {
        console.warn('Failed to persist score to backend database. Session will remain locally active.', err);
      }
    }

    setGameState(GameState.FINISHED);
  };

  const handlePlayAgain = () => {
    if (selectedSong) {
      setGameState(GameState.PLAYING);
    }
  };

  const handleSelectDifferent = () => {
    setGameState(GameState.SONG_SELECT);
  };

  const handleBackToMenu = () => {
    setGameState(GameState.MENU);
    setSelectedSong(null);
  };

  const sidebar = (
    <Sidebar 
      userStats={{
        wpm: personalBestWPM || 0,
        accuracy: avgAccuracy || 0,
        level: Math.floor(gamesPlayed / 5) + 1,
        rank: gamesPlayed > 20 ? "Tempo Master" : gamesPlayed > 10 ? "Rhythm Pro" : "Rhythm Rookie",
        streak: streak
      }}
    />
  );

  if (gameState === GameState.PLAYING && selectedSong) {
    return (
      <Layout>
        <TypingGame
          lyrics={selectedSong.lyrics}
          songTitle={selectedSong.title}
          artist={selectedSong.artist}
          audioUrl={selectedSong.audioUrl}
          syncedLyrics={selectedSong.syncedLyrics}
          onComplete={handleGameComplete}
          onBack={handleBackToMenu}
        />
      </Layout>
    );
  }

  return (
    <DashboardLayout sidebar={sidebar}>
      {gameState === GameState.MENU && (
        <MenuScreen
          onPlayClick={handlePlayClick}
          onSelectSong={handleSelectSong}
          personalBestWPM={personalBestWPM}
          gamesPlayed={gamesPlayed}
          scoreHistory={scoreHistory}
          avgAccuracy={avgAccuracy}
        />
      )}

      {gameState === GameState.SONG_SELECT && (
        <SongSelectionScreen
          songs={songs}
          personalBestWPM={personalBestWPM}
          onSelectSong={handleSelectSong}
          onSongImported={handleSongImported}
          onBack={handleBackToMenu}
        />
      )}

      {gameState === GameState.FINISHED &&
        selectedSong &&
        lastGameStats && (
          <GameResults
            songTitle={selectedSong.title}
            artist={selectedSong.artist}
            stats={lastGameStats}
            onPlayAgain={handlePlayAgain}
            onSelectDifferent={handleSelectDifferent}
            onBackToMenu={handleBackToMenu}
          />
        )}
    </DashboardLayout>
  );
};

