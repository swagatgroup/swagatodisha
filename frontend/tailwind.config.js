/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        // ── Royal Indigo + Warm Marigold Gold Palette ──
        'brand': {
          'primary':        '#4A1D7A',
          'primary-dark':   '#351458',
          'primary-light':  '#F0E6FA',
          'primary-muted':  '#6B3F99',
          'accent':         '#E8A817',
          'accent-dark':    '#C48D0F',
          'accent-light':   '#FEF5DC',
          'teal':           '#1D4B5E',
          'teal-medium':    '#387B95',
          'teal-light':     '#D0E8F0',
          'cream':          '#FAF7F2',
          'cream-dark':     '#F0EBE3',
          'text-dark':      '#1A1A1A',
          'text-muted':     '#5A5A5A',
          'dark-bg':        '#1A1212',
          'dark-surface':   '#231A2E',
          'dark-border':    '#3D2A4A',
          'dark-primary':   '#9B6FCC',
        },
        // Purple scale aligned to Royal Indigo
        'purple': {
          50:  '#F0E6FA',
          100: '#DFCBF5',
          200: '#C9A8E8',
          300: '#A878D4',
          400: '#8A50BF',
          500: '#4A1D7A',
          600: '#3F1969',
          700: '#351458',
          800: '#2A1047',
          900: '#200C36',
        },
      },
      fontFamily: {
        'baloo': ['"Baloo 2"', 'cursive', 'system-ui'],
        'lato':  ['Lato', 'system-ui', 'sans-serif'],
        'sans':  ['Lato', 'system-ui', 'sans-serif'],
        // Keep these so old code doesn't break
        'futuristic': ['Lato', 'system-ui', 'sans-serif'],
        'display':    ['"Baloo 2"', 'cursive', 'system-ui'],
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'pulse-slow':  'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in':     'fadeIn 0.8s ease-out',
        'slide-up':    'slideUp 0.6s ease-out',
        'scale-in':    'scaleIn 0.5s ease-out',
        'scroll-up':   'scrollUp 20s linear infinite',
        'wave':        'wave 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' }
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        scrollUp: {
          '0%':   { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(-50%)' }
        },
        wave: {
          '0%, 100%': { transform: 'translateX(0) scaleY(1)' },
          '50%':      { transform: 'translateX(-5%) scaleY(1.05)' }
        }
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'brand':       '0 4px 24px rgba(74, 29, 122, 0.12)',
        'brand-lg':    '0 8px 40px rgba(74, 29, 122, 0.18)',
        'teal':        '0 4px 24px rgba(29, 75, 94, 0.15)',
        'card':        '0 4px 24px rgba(0, 0, 0, 0.06)',
        'card-lg':     '0 8px 40px rgba(0, 0, 0, 0.10)',
        'nav':         '0 8px 24px rgba(0, 0, 0, 0.06)',
        // Legacy aliases so old code doesn't error
        'futuristic':    '0 4px 24px rgba(74, 29, 122, 0.12)',
        'futuristic-lg': '0 8px 40px rgba(74, 29, 122, 0.18)',
        'futuristic-xl': '0 12px 48px rgba(74, 29, 122, 0.22)',
        'glow-blue':   '0 4px 20px rgba(56, 123, 149, 0.4)',
        'glow-cyan':   '0 4px 20px rgba(29, 75, 94, 0.4)',
        'glow-purple': '0 4px 20px rgba(74, 29, 122, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // Legacy alias — now resolves to a subtle warm gradient
        'futuristic':      'linear-gradient(135deg, #FAF7F2 0%, #F0E6FA 50%, #FAF7F2 100%)',
        'futuristic-glow': 'linear-gradient(135deg, #FAF7F2 0%, #F0E6FA 50%, #FAF7F2 100%)',
      },
      borderRadius: {
        'pill': '100px',
        '4xl':  '2rem',
      },
    },
  },
  plugins: [],
}