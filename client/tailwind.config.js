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
      }
    }
  },
  plugins: []
};
