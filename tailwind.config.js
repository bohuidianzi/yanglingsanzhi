/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8EDF3',
          100: '#C5D1E3',
          200: '#8FA3C7',
          300: '#5975AB',
          400: '#2A5A8A',
          500: '#0F2B47',
          600: '#0C2339',
          700: '#081B30',
          800: '#051321',
          900: '#030B13',
        },
        secondary: {
          50: '#FDF3E5',
          100: '#FAE0BB',
          200: '#F5C67A',
          300: '#E09A3F',
          400: '#D4862A',
          500: '#B86F1F',
          600: '#935918',
          700: '#6E4311',
          800: '#492D0A',
          900: '#251604',
        },
        success: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#6BB87E',
          400: '#4DA768',
          500: '#3A8F5C',
          600: '#2A6B42',
          700: '#1B4B2E',
          800: '#11321F',
          900: '#07190F',
        },
        textDark: '#2D3748',
        textMedium: '#718096',
        textLight: '#A0AEC0',
        divider: '#E2E8F0',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"Roboto"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
