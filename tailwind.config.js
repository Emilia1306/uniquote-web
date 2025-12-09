/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,ts,scss}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Quicksand', 'ui-sans-serif', 'system-ui'],
      },

      colors: {
        brand: {
          50:  '#FFF3F2',
          100: '#FFE4E1',
          200: '#FFCDC7',
          300: '#FFADA3',
          400: '#FF8A7E',
          500: '#F05546',   // NARANJA/ROJO PRINCIPAL
          600: '#E0493C',
          700: '#C53C31',
          800: '#A23028',
          900: '#7A231C',
        },

        peach: {
          50:  '#FFF6EF',
          100: '#FFEBDD',
          200: '#FDD8C0',
          300: '#FBC4A1',
        },
      },

      borderRadius: {
        xl: '14px',
        '2xl': '18px',
      },

      boxShadow: {
        card: '0 4px 16px rgba(0,0,0,0.05)',
        soft: '0 1px 0 rgba(0,0,0,.02), 0 8px 24px rgba(17,24,39,.04)',
      },
    },
  },
  plugins: [],
};
