/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Archivo Black"', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        cat: {
          yellow: '#FFC500',
          black: '#101010',
          dark: '#1c1c1c',
          gray: '#2b2b2b',
          light: '#f4f4f4',
        },
      },
      boxShadow: {
        card: '0 8px 20px rgba(0,0,0,0.10)',
      },
      keyframes: {
        rowflash: {
          '0%': { backgroundColor: 'rgba(255, 197, 0, 0.55)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      animation: {
        rowflash: 'rowflash 1s ease-out',
      },
    },
  },
  plugins: [],
}
