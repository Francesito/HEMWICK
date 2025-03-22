/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      colors: {
        neonCyan: '#00f5e1',
        neonMagenta: '#ff00cc',
        neonPurple: '#6b21a8',
        darkBg: '#0a0a0a',
        cardBg: '#1a1a1a',
      },
      animation: {
        'draw': 'draw 3s ease-in-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'rotate-glove': 'rotateGlove 5s infinite ease-in-out',
      },
      keyframes: {
        draw: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        rotateGlove: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.2)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
      },
      boxShadow: {
        'neon': '0 0 15px rgba(0, 245, 225, 0.5), 0 0 30px rgba(0, 245, 225, 0.3)',
        'neon-hover': '0 0 20px rgba(0, 245, 225, 0.7), 0 0 40px rgba(0, 245, 225, 0.5)',
      },
    },
  },
  plugins: [],
}