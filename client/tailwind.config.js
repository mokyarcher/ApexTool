/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        apex: {
          red: '#DA292A',
          orange: '#F4AE3D',
          dark: '#0B0B0D',
          panel: '#151519',
          border: '#2A2A31'
        }
      },
      fontFamily: {
        display: ['"Teko"', 'Impact', 'sans-serif']
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out'
      }
    }
  },
  plugins: []
};
