/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a9f7',
          500: '#0c8de9',
          600: '#016ec7',
          700: '#0258a1',
          800: '#064b85',
          900: '#0b3f6f',
          950: '#07284a',
        },
        navy: {
          800: '#151f38',
          850: '#0f172a',
          900: '#0a1020',
          950: '#050914',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(12, 141, 233, 0.15)',
        'glow': '0 0 25px -5px rgba(12, 141, 233, 0.25)',
        'glow-lg': '0 0 40px -8px rgba(12, 141, 233, 0.35)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        }
      },
      animation: {
        'pulse-slow': 'pulseGlow 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
