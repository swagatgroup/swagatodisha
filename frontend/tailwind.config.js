/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'tablet': '768px',
        'laptop': '1024px',
      },
      height: {
        'screen-safe': 'calc(var(--vh, 1vh) * 100)',
      },
      minHeight: {
        'screen-safe': 'calc(var(--vh, 1vh) * 100)',
      },
      colors: {
        // Futuristic color palette inspired by Google One AI
        'futuristic': {
          'black': '#000000',
          'dark': '#0a0a0a',
          'darker': '#050505',
          'blue': {
            50: '#e6f3ff',
            100: '#b3d9ff',
            200: '#80bfff',
            300: '#4da6ff',
            400: '#1a8cff',
            500: '#0073e6',
            600: '#005bb3',
            700: '#004280',
            800: '#002a4d',
            900: '#00111a',
          },
          'cyan': {
            50: '#e6ffff',
            100: '#b3ffff',
            200: '#80ffff',
            300: '#4dffff',
            400: '#1affff',
            500: '#00e6e6',
            600: '#00b3b3',
            700: '#008080',
            800: '#004d4d',
            900: '#001a1a',
          },
          'purple': {
            50: '#f0e6ff',
            100: '#d9b3ff',
            200: '#c280ff',
            300: '#ab4dff',
            400: '#941aff',
            500: '#7d00e6',
            600: '#6100b3',
            700: '#450080',
            800: '#29004d',
            900: '#0d001a',
          },
          'red': {
            50: '#ffe6e6',
            100: '#ffb3b3',
            200: '#ff8080',
            300: '#ff4d4d',
            400: '#ff1a1a',
            500: '#e60000',
            600: '#b30000',
            700: '#800000',
            800: '#4d0000',
            900: '#1a0000',
          }
        }
      },
      fontFamily: {
        'futuristic': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%': {
            boxShadow: '0 0 5px #0073e6, 0 0 10px #0073e6, 0 0 15px #0073e6',
            textShadow: '0 0 5px #0073e6'
          },
          '100%': {
            boxShadow: '0 0 10px #0073e6, 0 0 20px #0073e6, 0 0 30px #0073e6',
            textShadow: '0 0 10px #0073e6'
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'futuristic': '0 0 20px rgba(0, 115, 230, 0.3)',
        'futuristic-lg': '0 0 40px rgba(0, 115, 230, 0.4)',
        'futuristic-xl': '0 0 60px rgba(0, 115, 230, 0.5)',
        'glow-blue': '0 0 20px rgba(0, 115, 230, 0.6)',
        'glow-cyan': '0 0 20px rgba(0, 230, 230, 0.6)',
        'glow-purple': '0 0 20px rgba(125, 0, 230, 0.6)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'futuristic': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        'futuristic-glow': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 30%, #16213e 70%, #0a0a0a 100%)',
      }
    },
  },
  plugins: [],
} 