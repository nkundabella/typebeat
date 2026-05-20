import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mystical color palette
        'dark-bg': '#0a0e27',
        'dark-card': '#1a1f3a',
        'neon-cyan': '#00f0ff',
        'neon-violet': '#bd00ff',
        'neon-pink': '#ff00ff',
        'neon-gold': '#ffd700',
      },
      fontFamily: {
        'display': ['Space Grotesk', 'Audiowide', 'sans-serif'],
        'mono': ['Courier Prime', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.5)',
        'glow-violet': '0 0 20px rgba(189, 0, 255, 0.5)',
        'glow-pink': '0 0 20px rgba(255, 0, 255, 0.5)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

