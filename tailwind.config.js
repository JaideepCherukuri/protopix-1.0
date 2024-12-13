/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        'shimmer-border': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0%)' }
        }
      },
      animation: {
        'shimmer-border': 'shimmer-border 3s infinite linear'
      }
    }
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};
