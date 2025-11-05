/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,ts,scss}'],
  darkMode: 'class',
  theme: {
    extend: {
      container: { center: true, screens: { '2xl': '1600px' } },
      boxShadow: { soft: '0 8px 30px rgba(0,0,0,0.06)' },
      borderRadius: { '2xl': '1rem' }
    },
  },
  plugins: [],
}
