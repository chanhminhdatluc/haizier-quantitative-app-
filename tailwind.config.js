/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B1220',
          900: '#111A2B',
          800: '#1A253A',
        },
        fintech: {
          50: '#F8FBFF',
          100: '#F5F9FF',
          200: '#E7F0FF',
          300: '#D4E5FF',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E3A8A',
          900: '#0F172A',
        },
        brand: {
          500: '#38BDF8',
          400: '#67E8F9',
        },
      },
    },
  },
  plugins: [],
}

