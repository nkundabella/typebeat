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
      this.typedText += char;
      this.updateCharacterState();
    }
  }

  /**
   * Remove last typed character (backspace)
   */
  removeCharacter(): void {
    if (this.typedText.length > 0) {
      this.typedText = this.typedText.slice(0, -1);
      this.updateCharacterState();
    }
  }

  /**
   * Update character state based on current typed text
   */
  private updateCharacterState(): void {
    for (let i = 0; i < this.characterStates.length; i++) {
      if (i < this.typedText.length) {
        this.characterStates[i].typed = true;
        this.characterStates[i].correct =
          this.typedText[i] === this.targetText[i];
      } else {
        this.characterStates[i].typed = false;
        this.characterStates[i].correct = false;
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
