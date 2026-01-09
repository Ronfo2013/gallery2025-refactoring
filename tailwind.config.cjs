/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
    './contexts/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        night: {
          950: '#050505',
          900: '#0a0a0c',
          800: '#111114',
          700: '#1a1a1e',
          600: '#242429',
        },
        accent: {
          indigo: '#6366f1',
          violet: '#8b5cf6',
          purple: '#a855f7',
          fuchsia: '#d946ef',
          pink: '#ec4899',
          rose: '#f43f5e',
        },
      },
      backgroundImage: {
        'mesh-gradient':
          'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(168, 85, 247, 0.15) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(244, 63, 94, 0.15) 0, transparent 50%), radial-gradient(at 0% 100%, rgba(139, 92, 246, 0.15) 0, transparent 50%)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 6s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          from: { 'box-shadow': '0 0 10px -2px var(--tw-shadow-color)' },
          to: { 'box-shadow': '0 0 20px 2px var(--tw-shadow-color)' },
        },
      },
    },
  },
  plugins: [],
};
