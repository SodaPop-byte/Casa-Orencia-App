/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // --- THIS BLOCK DEFINES THE NEW COLORS ---
      colors: {
        'theme-light': '#F5F5DC', // A light beige/cream background
        'theme-dark': '#8B4513',   // A deep saddle brown
        'theme-accent': '#D4AF37', // A rich gold/amber accent
        'theme-accent-hover': '#B8860B', // A darker gold for hover
      },
      // --- END NEW COLORS ---
      
      // --- THIS BLOCK DEFINES THE NEW FONTS ---
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      // --- END NEW FONTS ---
    },
  },
  plugins: [],
}