/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        garlic: {
          50: '#FAF8F5',
          100: '#F5F1E8',
          200: '#EAE1D0',
          300: '#D6C5A8',
          400: '#BEA37B',
          500: '#A68355',
          600: '#8A6740',
          700: '#6C4D32',
          800: '#4D3624',
          900: '#2F2016',
        },
        sprout: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        purpleAjo: {
          700: '#5B21B6',
          800: '#4C1D95',
          900: '#2E1065',
        },
        gold: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'bounce-short': 'bounceShort 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'float-up': 'floatUp 0.8s ease-out forwards',
        'wiggle': 'wiggle 0.3s ease-in-out infinite',
      },
      keyframes: {
        bounceShort: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.92)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(16, 185, 129, 0.8)' },
        },
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-60px) scale(1.3)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
}
