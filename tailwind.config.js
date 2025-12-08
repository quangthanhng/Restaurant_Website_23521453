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
      },
      keyframes: {
        'pie-grow': {
          '0%': { transform: 'scale(0) rotate(-90deg)', opacity: '0' },
          '50%': { transform: 'scale(1.05) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' }
        },
        'fade-in-right': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'bar-grow': {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' }
        },
        'fade-in-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        'pie-grow': 'pie-grow 0.8s ease-out forwards',
        'fade-in-right': 'fade-in-right 0.5s ease-out forwards',
        'bar-grow': 'bar-grow 0.6s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards'
      }
    }
  },
  plugins: []
}
