/**
 * Game difficulty levels
 */
export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

/**
 * Game state types
 */
export enum GameState {
  MENU = 'menu',
  SONG_SELECT = 'song_select',
  PLAYING = 'playing',
  PAUSED = 'paused',
  FINISHED = 'finished',
}

/**
 * Song metadata
 */
export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  lyrics: string;
  duration: number; // in seconds
  audioUrl: string;
  requiredWPM?: number; // WPM needed to unlock
  locked?: boolean;
}

/**
 * Typing session statistics
 */
export interface TypingStats {
  totalChars: number;
  correctChars: number;
  incorrectChars: number;
  elapsedTime: number; // in seconds
  wpm: number;
  accuracy: number; // percentage 0-100
}

/**
 * Game session result
 */
export interface GameResult {
  songId: string;
  difficulty: Difficulty;
  stats: TypingStats;
  completedAt: Date;
  score: number; // calculated based on accuracy and speed
}

/**
 * User profile/progress
 */
export interface UserProgress {
  totalGamesPlayed: number;
  personalBestWPM: number;
  averageAccuracy: number;
  unlockedSongs: string[];
  achievements: string[];
  gameHistory: GameResult[];
}

/**
 * Typed character data for highlighting
 */
export interface CharacterStatus {
  char: string;
  correct: boolean;
  typed: boolean;
  index: number;
}
