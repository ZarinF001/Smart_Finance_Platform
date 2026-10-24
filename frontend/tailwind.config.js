/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9fe',
          200: '#c7d6fe',
          300: '#a4bbfd',
          400: '#7c96fa',
          500: '#536df5',
          600: '#3d4de8',
          700: '#2d37c8',
          800: '#1e247e',
          900: '#141854',
          950: '#0b0e33',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        financial: {
          positive: '#10b981', // emerald
          positiveDark: '#047857',
          negative: '#ef4444', // red/rose
          negativeDark: '#b91c1c',
          warning: '#f59e0b', // amber
          warningDark: '#b45309',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'card': '0.75rem',
      },
    },
  },
  plugins: [],
};
