import type { TypingStats } from '@/types';

/**
 * Calculate Words Per Minute (WPM)
 * Standard formula: (typed_characters / 5) / time_in_minutes
 * The division by 5 is industry standard (avg word length)
 */
export function calculateWPM(
  correctCharacters: number,
  elapsedTimeSeconds: number
): number {
  if (elapsedTimeSeconds <= 0) return 0;
  
  // Standard Net WPM: (correct_chars / 5) / minutes
  const words = correctCharacters / 5;
  const minutes = elapsedTimeSeconds / 60;
  const wpm = words / minutes;
  
  return Math.round(wpm * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(
  correctChars: number,
  totalChars: number
): number {
  if (totalChars === 0) return 0;
  return Math.round((correctChars / totalChars) * 1000) / 10; // Round to 1 decimal
}

/**
 * Calculate game score based on WPM and accuracy
 * Score formula: (WPM * 10) + (accuracy * 2)
 * Encourages both speed and accuracy
 */
export function calculateScore(wpm: number, accuracy: number): number {
  return Math.round(wpm * 10 + accuracy * 2);
}

/**
 * Generate typing statistics from session data
 */
export function generateStats(
  totalChars: number,
  correctChars: number,
  elapsedTimeSeconds: number
): TypingStats {
  const incorrectChars = totalChars - correctChars;
  const wpm = calculateWPM(correctChars, elapsedTimeSeconds);
  const accuracy = calculateAccuracy(correctChars, totalChars);

  return {
    totalChars,
    correctChars,
    incorrectChars,
    elapsedTime: elapsedTimeSeconds,
    wpm,
    accuracy,
  };
}

/**
 * Determine if user qualifies to unlock a song
 */
export function checkUnlock(currentWPM: number, requiredWPM?: number): boolean {
  if (!requiredWPM) return true; // No requirement
  return currentWPM >= requiredWPM;
}
