/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Minimalist SaaS Base Palette
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af', // Primary institutional accent
          900: '#1e3a8a',
          950: '#172554',
        },
        // Semantic High-Contrast Sunlight Status Colors
        status: {
          accepted: {
            DEFAULT: '#15803d', // Green 700 (WCAG AAA contrast on light bg)
            bg: '#dcfce7',      // Green 100
            border: '#86efac',  // Green 300
            text: '#14532d',    // Green 900
          },
          flagged: {
            DEFAULT: '#b45309', // Amber 700
            bg: '#fef3c7',      // Amber 100
            border: '#fcd34d',  // Amber 300
            text: '#78350f',    // Amber 900
          },
          invalid: {
            DEFAULT: '#b91c1c', // Red 700
            bg: '#fee2e2',      // Red 100
            border: '#fca5a5',  // Red 300
            text: '#7f1d1d',    // Red 900
          },
        },
        // Utilitarian surface shades
        surface: {
          subtle: '#f8fafc',
          muted: '#f1f5f9',
          border: '#e2e8f0',
          'border-strong': '#cbd5e1',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      minHeight: {
        'touch': '48px', // Fitts's law touch target requirement
      },
      minWidth: {
        'touch': '48px',
      },
    },
  },
  plugins: [],
};
