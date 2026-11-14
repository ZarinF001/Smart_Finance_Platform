/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        palette: {
          plum: '#3A3550',      // Swatch 1: Deepest dusky midnight plum
          dusk: '#585272',      // Swatch 2: Muted dark slate purple
          lavender: '#8A82A6',  // Swatch 3: Medium muted lavender / purple slate
          lilac: '#B7AFC9',     // Swatch 4: Soft dusty lavender / lilac grey
          mist: '#DCD3E0',      // Swatch 5: Light pastel lavender / border tint
          cloud: '#F4EFF3',     // Swatch 6: Very light soft lavender white / off-white
        },
        brand: {
          50: '#F4EFF3',   // Swatch 6: Lightest lavender tint / surface
          100: '#ECE6EE',
          200: '#DCD3E0',  // Swatch 5: Pastel border & subtle accent
          300: '#B7AFC9',  // Swatch 4: Soft lilac / active tag
          400: '#9F97B8',
          500: '#8A82A6',  // Swatch 3: Muted lavender / focus rings / icons
          600: '#585272',  // Swatch 2: Primary brand action / dusk button
          700: '#47405F',  // Hover state / deep dusk
          800: '#3A3550',  // Swatch 1: Deep dusky plum
          900: '#2C273E',
          950: '#201C2E',
        },
        slate: {
          50: '#F4EFF3',   // Swatch 6: App canvas & soft card headers
          100: '#ECE6EE',  // Subtle table rows & badge backgrounds
          200: '#DCD3E0',  // Swatch 5: Card & divider borders
          300: '#B7AFC9',  // Swatch 4: Input borders & scrollbars
          400: '#9E96B4',  // Placeholder text & secondary icons
          500: '#8A82A6',  // Swatch 3: Subtitles & secondary labels
          600: '#6E668B',  // Readable body text
          700: '#585272',  // Swatch 2: Strong labels & table headings
          800: '#47415F',  // Section titles
          900: '#3A3550',  // Swatch 1: High-contrast primary headings
          950: '#231F33',
        },
        financial: {
          income: '#059669', // emerald-600
          incomeBg: '#ecfdf5',
          expense: '#dc2626', // rose-600
          expenseBg: '#fef2f2',
          warning: '#d97706', // amber-600
          warningBg: '#fffbeb',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(58, 53, 80, 0.05)',
        'card': '0 1px 3px 0 rgba(58, 53, 80, 0.07), 0 1px 2px -1px rgba(58, 53, 80, 0.04)',
        'dropdown': '0 4px 6px -1px rgba(58, 53, 80, 0.10), 0 2px 4px -2px rgba(58, 53, 80, 0.05)',
      },
      borderRadius: {
        'card': '0.625rem', // 10px - restrained, not overly rounded
      },
    },
  },
  plugins: [],
};
