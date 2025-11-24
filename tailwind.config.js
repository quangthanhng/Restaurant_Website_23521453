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
        },
        'savoria-gold': 'rgb(230, 194, 161)'
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif']
      },
      letterSpacing: {
        logo: '-0.3px'
      },
      lineHeight: {
        logo: '46.8px'
      }
    }
  },
  plugins: []
}
