import type { Song } from '@/types';
import { Difficulty } from '@/types';

/**
 * Sample songs for the game
 * In production, this would come from a database
 */
export const SAMPLE_SONGS: Song[] = [
  {
    id: 'song_1',
    title: 'Ethereal Dreams',
    artist: 'Cosmic Echo',
    genre: 'Synthwave',
    lyrics: `In the neon glow of the midnight sky\nWhere the stars dance and the dreams fly high\nI find myself lost in your eyes\nAs the world around us slowly dies`,
    duration: 180,
    audioUrl: '/audio/ethereal-dreams.mp3',
    locked: false,
    bpm: 120,
    difficulty: Difficulty.BEGINNER,
    coverArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop'
  },
  {
    id: 'song_2',
    title: 'Digital Heart',
    artist: 'Synth Wave',
    genre: 'Electronic',
    lyrics: `Circuits pulsing with electric dreams\nNothing is ever what it seems\nBinary heartbeat in the code\nFollowing the digital road`,
    duration: 200,
    audioUrl: '/audio/digital-heart.mp3',
    requiredWPM: 40,
    locked: false,
    bpm: 140,
    difficulty: Difficulty.INTERMEDIATE,
    coverArt: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop'
  },
  {
    id: 'song_3',
    title: 'Neon Knights',
    artist: 'Night Runner',
    genre: 'Synthwave',
    lyrics: `Riding through the city streets so bright\nNeon knights of the endless night\nChasing shadows and the morning light\nWe are the legends of the fight`,
    duration: 220,
    audioUrl: '/audio/neon-knights.mp3',
    requiredWPM: 60,
    locked: true,
    bpm: 165,
    difficulty: Difficulty.ADVANCED,
    coverArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop'
  },
  {
    id: 'song_4',
    title: 'Quantum Leap',
    artist: 'Future Pulse',
    genre: 'Electronic',
    lyrics: `Jumping through dimensions of time and space\nRunning at the quantum pace\nEvery moment is a brand new place\nWhere we find our saving grace`,
    duration: 190,
    audioUrl: '/audio/quantum-leap.mp3',
    requiredWPM: 50,
    locked: true,
    bpm: 155,
    difficulty: Difficulty.INTERMEDIATE,
    coverArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'
  },
];

/**
 * Get all available songs
 */
export function getAllSongs(): Song[] {
  return SAMPLE_SONGS;
}

/**
 * Get song by ID
 */
export function getSongById(id: string): Song | undefined {
  return SAMPLE_SONGS.find((song) => song.id === id);
}

/**
 * Get songs by difficulty (based on required WPM)
 */
export function getSongsByDifficulty(difficulty: Difficulty): Song[] {
  const difficultyThresholds: Record<Difficulty, number> = {
    [Difficulty.BEGINNER]: 0,
    [Difficulty.INTERMEDIATE]: 40,
    [Difficulty.ADVANCED]: 60,
  };

  const threshold = difficultyThresholds[difficulty];
  return SAMPLE_SONGS.filter((song) => {
    const required = song.requiredWPM ?? 0;
    return required >= threshold && required < threshold + 30;
  });
}

/**
 * Get unique genres from all songs
 */
export function getAllGenres(): string[] {
  const genres = new Set(SAMPLE_SONGS.map((song) => song.genre));
  return Array.from(genres);
}
