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
    lyrics: `In the neon glow of the midnight sky
Where the stars dance and the dreams fly high
I find myself lost in your eyes
As the world around us slowly dies`,
    duration: 180,
    audioUrl: '/audio/ethereal-dreams.mp3',
    locked: false,
  },
  {
    id: 'song_2',
    title: 'Digital Heart',
    artist: 'Synth Wave',
    genre: 'Electronic',
    lyrics: `Circuits pulsing with electric dreams
Nothing is ever what it seems
Binary heartbeat in the code
Following the digital road`,
    duration: 200,
    audioUrl: '/audio/digital-heart.mp3',
    requiredWPM: 40,
    locked: true,
  },
  {
    id: 'song_3',
    title: 'Neon Knights',
    artist: 'Night Runner',
    genre: 'Synthwave',
    lyrics: `Riding through the city streets so bright
Neon knights of the endless night
Chasing shadows and the morning light
We are the legends of the fight`,
    duration: 220,
    audioUrl: '/audio/neon-knights.mp3',
    requiredWPM: 60,
    locked: true,
  },
  {
    id: 'song_4',
    title: 'Quantum Leap',
    artist: 'Future Pulse',
    genre: 'Electronic',
    lyrics: `Jumping through dimensions of time and space
Running at the quantum pace
Every moment is a brand new place
Where we find our saving grace`,
    duration: 190,
    audioUrl: '/audio/quantum-leap.mp3',
    requiredWPM: 50,
    locked: true,
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
