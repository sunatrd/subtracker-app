/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF5A5F', // Airbnb "Rausch"
          dark: '#E00B41',    // Hover state for primary
          teal: '#00A699',    // "Babu" - Secondary accent
          orange: '#FC642D',  // "Arches" - Warning accent
          black: '#484848',   // "Hofmann" - Main text
          gray: '#767676',    // "Foggy" - Secondary text
          light: '#F7F7F7',   // Light page background
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 6px 16px rgba(0,0,0,0.12)',
        'soft': '0 2px 8px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}