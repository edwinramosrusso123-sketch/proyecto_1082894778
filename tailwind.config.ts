import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#13211f',
          soft: '#3d524e',
          faint: '#7c918d',
        },
        teal: {
          50: '#eefbf8',
          100: '#cdf3ec',
          200: '#9ee7da',
          300: '#67d3c3',
          400: '#37b8a7',
          500: '#0d9488',
          600: '#0a766e',
          700: '#0c5f59',
          800: '#0e4c48',
          900: '#0f3f3c',
        },
        sand: {
          50: '#faf8f3',
          100: '#f3eee2',
          200: '#e7dcc6',
          300: '#d7c4a0',
        },
        gold: {
          400: '#d9a441',
          500: '#c08a2d',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(19,33,31,0.04), 0 8px 24px -12px rgba(19,33,31,0.18)',
        lift: '0 2px 6px rgba(19,33,31,0.06), 0 24px 48px -20px rgba(19,33,31,0.30)',
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
