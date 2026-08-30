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
        // ── Reference Theme Palette (GM Public School → Swagat Odisha) ──
        'brand': {
          'primary':        '#7B3FA0',
          'primary-dark':   '#5C2D80',
          'primary-light':  '#EDE0F7',
          'primary-muted':  '#905391',
          'accent':         '#F5A623',
          'accent-dark':    '#D4880B',
          'accent-light':   '#FEF3DC',
          'teal':           '#1D4B5E',
          'teal-medium':    '#387B95',
          'teal-light':     '#D0E8F0',
          'cream':          '#FAF7F2',
          'cream-dark':     '#F0EBE3',
          'text-dark':      '#1A1A1A',
          'text-muted':     '#666666',
          'dark-bg':        '#1A1212',
          'dark-surface':   '#2A1E2E',
          'dark-border':    '#3D2A4A',
          'dark-primary':   '#A855D0',
        },
        // Keep purple/indigo aliases pointing to brand for compatibility
        'purple': {
          50:  '#EDE0F7',
          100: '#DCC5F0',
          200: '#C9A8E8',
          300: '#B080D8',
          400: '#9A5CC8',
          500: '#7B3FA0',
          600: '#6A338C',
          700: '#5C2D80',
          800: '#4A2268',
          900: '#3A1950',
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
        'brand':       '0 4px 24px rgba(123, 63, 160, 0.12)',
        'brand-lg':    '0 8px 40px rgba(123, 63, 160, 0.18)',
        'teal':        '0 4px 24px rgba(29, 75, 94, 0.15)',
        'card':        '0 4px 24px rgba(0, 0, 0, 0.06)',
        'card-lg':     '0 8px 40px rgba(0, 0, 0, 0.10)',
        'nav':         '0 8px 24px rgba(0, 0, 0, 0.06)',
        // Legacy aliases so old code doesn't error
        'futuristic':    '0 4px 24px rgba(123, 63, 160, 0.12)',
        'futuristic-lg': '0 8px 40px rgba(123, 63, 160, 0.18)',
        'futuristic-xl': '0 12px 48px rgba(123, 63, 160, 0.22)',
        'glow-blue':   '0 4px 20px rgba(56, 123, 149, 0.4)',
        'glow-cyan':   '0 4px 20px rgba(29, 75, 94, 0.4)',
        'glow-purple': '0 4px 20px rgba(123, 63, 160, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // Legacy alias — now resolves to a subtle warm gradient
        'futuristic':      'linear-gradient(135deg, #FAF7F2 0%, #EDE0F7 50%, #FAF7F2 100%)',
        'futuristic-glow': 'linear-gradient(135deg, #FAF7F2 0%, #EDE0F7 50%, #FAF7F2 100%)',
      },
      borderRadius: {
        'pill': '100px',
        '4xl':  '2rem',
      },
    },
  },
  plugins: [],
}