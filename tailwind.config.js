/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        beige: {
          100: '#F5E6D3',
          80: '#E8D4B8',
          70: '#DCC7A8',
          20: '#3D3530'
        },
        dark: {
          100: '#1A1A1A',
          70: '#4D4D4D',
          16: '#D6D6D6'
        }
      }
    }
  },
  plugins: []
}
