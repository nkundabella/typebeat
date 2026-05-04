# Typebeat - Music-Based Typing Game

## Overview

Typebeat is a web-based typing trainer where users improve their typing speed and accuracy by typing song lyrics in sync with music playback.

## Project Structure

```
typebeat/
├── src/
│   ├── components/
│   │   ├── UI.tsx              # Reusable UI components (Button, Card, Badge, etc.)
│   │   ├── Layout.tsx          # Header, Footer, main layout wrapper
│   │   ├── Menu.tsx            # Main menu screen
│   │   ├── SongSelection.tsx   # Song selection screen with filtering
│   │   ├── TypingGame.tsx      # Core typing game component
│   │   ├── GameResults.tsx     # Results/summary screen
│   │   └── App.tsx             # Main app state and navigation
│   ├── engine/
│   │   ├── TypingEngine.ts     # Core typing logic (character tracking, validation)
│   │   └── wpmCalculator.ts    # WPM and scoring calculations
│   ├── data/
│   │   └── songs.ts            # Sample songs database
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── index.css               # Global styles + mystical theme
│   └── main.tsx                # React entry point
├── index.html                  # HTML entry point
├── package.json                # Dependencies
├── tailwind.config.js          # TailwindCSS configuration with mystical theme
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite build configuration
```

## Key Features Implemented

### 1. **Mystical UI Theme**
   - Dark-themed base with neon accents (cyan, violet, pink, gold)
   - Glassmorphic cards with blur and glow effects
   - Game-style fonts (Space Grotesk, Audiowide)
   - Smooth animations with Framer Motion

### 2. **Typing Engine** (`TypingEngine.ts`)
   - Tracks character-by-character input
   - Validates each keystroke against target lyrics
   - Provides real-time feedback on correct/incorrect characters
   - Supports backspace for corrections

### 3. **WPM Calculation** (`wpmCalculator.ts`)
   - Industry-standard formula: (typed_characters / 5) / time_in_minutes
   - Accuracy percentage calculation
   - Score calculation combining speed and accuracy
   - Unlock system based on WPM thresholds

### 4. **Game Components**
   - **Menu Screen**: Shows personal best, games played
   - **Song Selection**: Grid of songs with difficulty indicators and unlock status
   - **Typing Game**: Real-time character highlighting, live WPM/accuracy, progress bar
   - **Game Results**: Performance rating, detailed breakdown, action buttons

### 5. **Game State Management**
   - Menu → Song Selection → Playing → Results → Menu cycle
   - Tracks personal best WPM
   - Maintains game history (games played count)

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Keyboard Controls

- **Type**: Start typing lyrics from the beginning
- **Backspace**: Remove last character
- **Game ends**: Automatically when all lyrics are typed

## Color Palette

- **Dark Base**: #0a0e27, #1a1f3a
- **Neon Accents**:
  - Cyan: #00f0ff
  - Violet: #bd00ff
  - Pink: #ff00ff
  - Gold: #ffd700

## Fonts

- **Display**: Space Grotesk, Audiowide (headings, titles)
- **Mono**: Courier Prime (typing text)

## Next Steps for Full Implementation

1. **Audio Integration**:
   - Add Web Audio API for music playback
   - Implement lyric synchronization with playback time
   - Add pause/resume functionality

2. **Database Integration**:
   - Replace sample songs with database
   - Store user progress and achievements
   - Implement user authentication

3. **Advanced Features**:
   - Multiple difficulty modes with playback speed variation
   - Achievement/badge system
   - Leaderboards
   - Multi-language support

4. **Performance Optimization**:
   - Code splitting
   - Image/font optimization
   - Lazy loading components

## Technologies Used

- **React 18**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Vite**: Fast build tool
