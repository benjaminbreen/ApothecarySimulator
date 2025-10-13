/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Prevents auto dark mode - only activates with .dark class
  content: [
    './index.html',
    './public/index.html',
    './src/**/*.{js,jsx,ts,tsx,css}',
  ],
  theme: {
    extend: {
      // Font families - Refined historical typography
      fontFamily: {
        sans: ['Source Sans Pro', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        serif: ['Crimson Text', 'Spectral', 'EB Garamond', 'Georgia', 'serif'],
        display: ['Cinzel', 'Crimson Text', 'Cormorant Garamond', 'Georgia', 'serif'],
        title: ['Cinzel', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },

      // IMPROVED: Proper type scale with line heights
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],        // 12px - labels
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0' }],        // 14px - secondary
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],           // 16px - body
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }], // 18px - emphasis
        'xl': ['1.25rem', { lineHeight: '1.875rem', letterSpacing: '-0.01em' }], // 20px - headings
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],     // 24px - section headers
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }], // 30px - page titles
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],   // 36px - hero
        '5xl': ['3rem', { lineHeight: '1.16', letterSpacing: '-0.03em' }],        // 48px - display
      },

      // IMPROVED: Extended color system with historical apothecary palette
      colors: {
        // Refined parchment - warmer, more aged
        parchment: {
          50: '#fdfbf7',
          100: '#f4e8d0',    // Lighter aged parchment
          200: '#ede0c8',    // Aged parchment gradient end
          300: '#e8dbb5',
          400: '#d6c18f',
          500: '#c4a777',
          600: '#a88c5f',
          700: '#8a7149',
          800: '#6f5b3e',
          900: '#5c4a34',
        },
        // Dark mode parchment - for dark backgrounds
        parchmentDark: {
          50: '#2a2520',   // Deep parchment for dark mode backgrounds
          100: '#352f29',  // Elevated surfaces in dark mode
          200: '#433d35',  // Borders and dividers in dark mode
          300: '#524a41',  // Muted elements
          400: '#6a5f54',  // Secondary text
        },
        // Deep ink black for text
        ink: {
          50: '#f8f8f7',
          100: '#efeeec',
          200: '#dddbd6',
          300: '#c5c2ba',
          400: '#a8a39a',
          500: '#8a857d',
          600: '#6e6a64',
          700: '#595651',
          800: '#4a4845',
          900: '#1a1a1a',    // Deep ink black
          950: '#1f1e1d',
        },
        // Extended slate for dark mode (candlelit night)
        slate: {
          950: '#0f0f11',    // Deep background for dark mode
        },
        // Historical apothecary green (main brand color)
        apothecary: {
          50: '#f0f5f3',
          100: '#dce8e3',
          200: '#b9d1c7',
          300: '#91b5a7',
          400: '#6d9685',
          500: '#4d7c6a',    // Medium apothecary green
          600: '#3d6b5a',    // Primary action color
          700: '#2d5a4a',    // Deep apothecary green (main)
          800: '#244a3c',
          900: '#1d3d31',
        },
        // Aged brass for accents and wealth
        brass: {
          50: '#fdf8ed',
          100: '#fbefd1',
          200: '#f6dda2',
          300: '#efc568',
          400: '#e8ad3d',
          500: '#d99825',
          600: '#b8860b',    // Aged brass
          700: '#9a6e0d',
          800: '#7f5711',
          900: '#6c4812',
        },
        // Enhanced amber for candlelight glow in dark mode
        amber: {
          400: '#fbbf24',    // Candlelight glow
          500: '#f59e0b',    // Warm amber accent
          600: '#d97706',    // Deep amber
        },
        // Medical crimson for health/warnings
        crimson: {
          50: '#fcf3f4',
          100: '#fae8ea',
          200: '#f5d5d9',
          300: '#ecb3bc',
          400: '#df8695',
          500: '#cc5d73',
          600: '#b54358',
          700: '#a83545',    // Light medical crimson
          800: '#8b2635',    // Medical crimson
          900: '#731f2b',
        },
        // Keep botanical for nature/herbs
        botanical: {
          50: '#f4f7f5',
          100: '#e8f0eb',
          200: '#d1e1d6',
          300: '#a8c4b3',
          400: '#7da590',
          500: '#5f8a6f',
          600: '#4a7c59',
          700: '#3d6449',
          800: '#32523c',
          900: '#284332',
        },
        // Amber warning
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Success green
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Purple for potions/compounds
        potion: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Keep danger red
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },

      // IMPROVED: Consistent 4px-based spacing scale
      spacing: {
        '0.5': '0.125rem',  // 2px
        '1': '0.25rem',     // 4px
        '1.5': '0.375rem',  // 6px
        '2': '0.5rem',      // 8px
        '2.5': '0.625rem',  // 10px
        '3': '0.75rem',     // 12px
        '3.5': '0.875rem',  // 14px
        '4': '1rem',        // 16px
        '5': '1.25rem',     // 20px
        '6': '1.5rem',      // 24px
        '7': '1.75rem',     // 28px
        '8': '2rem',        // 32px
        '9': '2.25rem',     // 36px
        '10': '2.5rem',     // 40px
        '11': '2.75rem',    // 44px
        '12': '3rem',       // 48px
        '14': '3.5rem',     // 56px
        '16': '4rem',       // 64px
        '20': '5rem',       // 80px
        '24': '6rem',       // 96px
        '28': '7rem',       // 112px
        '32': '8rem',       // 128px
      },

      // IMPROVED: Proper elevation system (Material Design-inspired)
      boxShadow: {
        'elevation-0': 'none',
        'elevation-1': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
        'elevation-2': '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
        'elevation-3': '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
        'elevation-4': '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)',
        'elevation-5': '0 20px 40px rgba(0, 0, 0, 0.2)',
        'inner-subtle': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'glow-botanical': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-potion': '0 0 20px rgba(168, 85, 247, 0.4)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.4)',
        // Dark mode - candlelight glow shadows
        'glow-amber': '0 0 20px rgba(251, 191, 36, 0.3)',
        'glow-amber-strong': '0 0 30px rgba(251, 191, 36, 0.4), 0 0 60px rgba(251, 191, 36, 0.2)',
        'dark-elevation-1': '0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 4px rgba(0, 0, 0, 0.3)',
        'dark-elevation-2': '0 4px 12px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.4)',
        'dark-elevation-3': '0 12px 24px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.5)',
      },

      // IMPROVED: Smooth transitions
      transitionDuration: {
        'fast': '150ms',
        'base': '250ms',
        'slow': '350ms',
        'slower': '500ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-subtle': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      // IMPROVED: Better animations
      animation: {
        'fade-in': 'fadeIn 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fadeIn': 'fadeIn 250ms cubic-bezier(0.4, 0, 0.2, 1)', // Alias for consistency
        'fade-in-up': 'fadeInUp 350ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slideUp': 'slideUp 400ms cubic-bezier(0.34, 1.56, 0.64, 1)', // Alias with bounce
        'slide-down': 'slideDown 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(34, 197, 94, 0.6)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(0.98)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },

      // IMPROVED: Better backdrop blur support
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}