import React, { useState } from 'react';
import { MenuScreen } from './Menu';
import { SongSelectionScreen } from './SongSelection';
import { TypingGame } from './TypingGame';
import { GameResults } from './GameResults';
import { Layout } from './Layout';
import { DashboardLayout } from './DashboardLayout';
import { Sidebar } from './Sidebar';
import { GameState } from '@/types';
import type { Song, GameResult, TypingStats } from '@/types';
import { getAllSongs } from '@/data/songs';

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

  const songs = getAllSongs();

  // Navigation handlers
  const handlePlayClick = () => {
    setGameState(GameState.SONG_SELECT);
  };

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    setGameState(GameState.PLAYING);
  };

  const handleGameComplete = (stats: GameStats) => {
    setLastGameStats(stats);
    setGamesPlayed((prev) => prev + 1);

    // Update personal best
    if (stats.wpm > personalBestWPM) {
      setPersonalBestWPM(stats.wpm);
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
        wpm: personalBestWPM || 65,
        accuracy: 98.5,
        level: 12 + gamesPlayed,
        rank: gamesPlayed > 10 ? "Tempo Master" : "Rhythm Rookie",
        streak: 5
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
          personalBestWPM={personalBestWPM}
          gamesPlayed={gamesPlayed}
        />
      )}

      {gameState === GameState.SONG_SELECT && (
        <SongSelectionScreen
          songs={songs}
          personalBestWPM={personalBestWPM}
          onSelectSong={handleSelectSong}
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
