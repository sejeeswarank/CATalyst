/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cat: {
          yellow: '#FFC72C',
          'yellow-dark': '#E6B325',
          black: '#101010',
          ink: '#1A1A1A',
          charcoal: '#232326',
          slate: '#3A3A3E',
        },
        border: '#E5E5E7',
        background: '#F7F7F8',
        success: { DEFAULT: '#16A34A', bg: '#DCFCE7', fg: '#166534' },
        warning: { DEFAULT: '#F59E0B', bg: '#FEF3C7', fg: '#92400E' },
        danger: { DEFAULT: '#DC2626', bg: '#FEE2E2', fg: '#991B1B' },
        info: { DEFAULT: '#2563EB', bg: '#DBEAFE', fg: '#1E40AF' },
      },
      fontFamily: {
        display: ['"Archivo Black"', '"Anton"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,16,16,0.04), 0 8px 24px -8px rgba(16,16,16,0.08)',
        soft: '0 1px 2px rgba(16,16,16,0.06)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
      },
    },
  },
  plugins: [],
};
