import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#c9a96e',
          light: '#e0c88a',
          dark: '#b8944e',
          deep: '#a07d3f',
          muted: 'rgba(201,169,110,0.15)',
        },
        sage: {
          DEFAULT: '#CCD5AE',
          light: '#E9EDC9',
          dark: '#4a5035',
          mid: '#dde3c4',
        },
        ivory: '#FEFAE0',
        beige: '#FAEDCD',
        tan: '#E2C2A2',
        cream: '#FEFAE0',
        kk: {
          bg: '#FEFAE0',
          card: '#FAEDCD',
          elevated: '#ffffff',
          surface: 'rgba(204,213,174,0.25)',
          highlight: 'rgba(201,169,110,0.08)',
          border: 'rgba(201,169,110,0.2)',
          'border-strong': 'rgba(201,169,110,0.4)',
          text: '#4a5035',
          'text-muted': '#6b7255',
          brown: '#7a5c3a',
          green: '#4a5035',
          'green-accent': '#6b7e55',
        },
        live: '#dc4444',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['clamp(2rem, 4vw, 3.2rem)', { lineHeight: '1.15', fontWeight: '300' }],
        'heading': ['clamp(1.6rem, 3vw, 2.4rem)', { lineHeight: '1.2', fontWeight: '300' }],
        'label': ['0.65rem', { letterSpacing: '0.5em', fontWeight: '400' }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 2px 20px rgba(74,80,53,0.06), 0 1px 6px rgba(201,169,110,0.08)',
        'card-hover': '0 8px 40px rgba(74,80,53,0.1), 0 2px 12px rgba(201,169,110,0.12)',
        'gold': '0 4px 20px rgba(201,169,110,0.25)',
        'soft': '0 1px 3px rgba(74,80,53,0.04)',
        'inner-gold': 'inset 0 0 0 1px rgba(201,169,110,0.15)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #d4b06a 0%, #e0c88a 35%, #c9a96e 50%, #b8944e 75%, #a07d3f 100%)',
        'sage-gradient': 'linear-gradient(135deg, #E9EDC9 0%, #CCD5AE 50%, #dde3c4 100%)',
        'ivory-gradient': 'linear-gradient(180deg, #FEFAE0 0%, #FAEDCD 100%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(254,250,224,0.3))',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fadeIn 0.6s ease forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,169,110,0.3)' },
          '50%': { boxShadow: '0 0 0 12px rgba(201,169,110,0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
