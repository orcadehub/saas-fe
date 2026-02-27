/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7ff',
          100: '#e7edff',
          500: '#3f5bd9',
          600: '#3149ba',
          700: '#263993'
        }
      },
      boxShadow: {
        glow: '0 20px 60px rgba(63, 91, 217, 0.15)'
      }
    }
  },
  plugins: []
};
