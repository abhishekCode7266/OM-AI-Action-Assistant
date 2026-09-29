/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        om: {
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#b9d5ff',
          300: '#7cb2ff',
          400: '#3888ff',
          500: '#0d5fe6',
          600: '#0047b8',
          700: '#00368d',
          800: '#042e73',
          900: '#092960',
          950: '#05183d',
        },
        surface: {
          dark: '#0B0F17',
          darker: '#06090E',
          card: '#111827',
          cardBorder: '#1F2937',
          hover: '#1F293D',
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1.0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(56, 136, 255, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(56, 136, 255, 0.7)' },
        }
      }
    },
  },
  plugins: [],
}
