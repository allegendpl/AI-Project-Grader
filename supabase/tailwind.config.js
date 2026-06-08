/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan: '#00f0ff',
          magenta: '#ff00ff',
          neon: '#39ff14',
          pink: '#ff2a6d',
          blue: '#0066ff',
          purple: '#1a0033',
          dark: '#050510',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      animation: {
        'glitch': 'glitch-effect 3s infinite linear alternate-reverse',
        'glitch-skew': 'glitch-skew 4s infinite linear alternate-reverse',
        'scan': 'scan 2s linear infinite',
        'scan-vertical': 'scan-vertical 4s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      clipPath: {
        'hexagon': 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        'corner-cut': 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))',
      },
    },
  },
  plugins: [],
};
