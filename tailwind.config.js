/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,ts,scss}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        quicksand: ['Quicksand', 'ui-sans-serif', 'system-ui'],
      },
      container: { center: true, screens: { '2xl': '1600px' } },
      boxShadow: { soft: '0 8px 30px rgba(0,0,0,0.06)' },
      borderRadius: { '2xl': '1rem' },
      colors: {
        peach: {
          25:  '#FEF8F2',
          50:  '#FEF2E7',  // fondo general
          75:  '#FBE9D8',  // hover
          100: '#F7E2CF',  // activo
        },
        accent: {
          500: '#F59E0B',
          600: '#EA8A00',  // naranja barra activa
          700: '#D97706',
        },
      },
    },
  },
  plugins: [],
}
