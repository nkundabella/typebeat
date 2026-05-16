import type { CharacterStatus } from '@/types';

/**
 * Core typing engine - compares user input against target lyrics
 */
export class TypingEngine {
  private targetText: string;
  private typedText: string = '';
  private characterStates: CharacterStatus[] = [];

  constructor(targetText: string) {
    this.targetText = targetText.trim();
    this.initializeCharacterStates();
  }

  /**
   * Initialize character state tracking
   */
  private initializeCharacterStates(): void {
    this.characterStates = this.targetText.split('').map((char, index) => ({
      char,
      correct: false,
      typed: false,
      index,
    }));
  }

  /**
   * Process typed character
   */
  addCharacter(char: string): void {
    if (this.typedText.length < this.targetText.length) {
      const index = this.typedText.length;
      this.typedText += char;
      
      // Update specific character state
      if (this.characterStates[index]) {
        this.characterStates[index].typed = true;
        this.characterStates[index].correct = char === this.targetText[index];
      }
    }
  }

  /**
   * Remove last typed character (backspace)
   */
  removeCharacter(): void {
    if (this.typedText.length > 0) {
      const index = this.typedText.length - 1;
      this.typedText = this.typedText.slice(0, -1);
      
      // Reset specific character state
      if (this.characterStates[index]) {
        this.characterStates[index].typed = false;
        this.characterStates[index].correct = false;
      }
    }
  }

  /**
   * Get character states for rendering
   */
  getCharacterStates(): CharacterStatus[] {
    return this.characterStates;
  }

  /**
   * Get current typed text
   */
  getTypedText(): string {
    return this.typedText;
  }

  /**
   * Get target text
   */
  getTargetText(): string {
    return this.targetText;
  }

  /**
   * Get stats
   */
  getStats(): {
    totalChars: number;
    typedChars: number;
    correctChars: number;
    incorrectChars: number;
    isComplete: boolean;
  } {
    const correctChars = this.characterStates.filter(
      (c) => c.typed && c.correct
    ).length;
    const incorrectChars = this.characterStates.filter(
      (c) => c.typed && !c.correct
    ).length;

    return {
      totalChars: this.targetText.length,
      typedChars: this.typedText.length,
      correctChars,
      incorrectChars,
      isComplete: this.typedText.length === this.targetText.length,
    };
  }

  /**
   * Reset the engine
   */
  reset(): void {
    this.typedText = '';
    this.initializeCharacterStates();
  }
}
