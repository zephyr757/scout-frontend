/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      fontWeight: {
        'thin': '100',
        'extralight': '200',
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      colors: {
        // Brand Colors
        brand: {
          navy: '#234071',     // Primary navy
          gold: '#daaf1b',     // Accent gold  
          teal: '#66d1ba',     // Secondary teal
        },
        // Extended palette based on brand colors
        navy: {
          50: '#f6f7fa',
          100: '#eceef5',
          200: '#d5dae8',
          300: '#b0bbd4',
          400: '#8595bb',
          500: '#6576a6',
          600: '#4f5d8a',
          700: '#234071',   // Brand navy
          800: '#1d3562',
          900: '#1a2f52',
          950: '#111d37',
        },
        gold: {
          50: '#fefbf3',
          100: '#fdf6e3',
          200: '#fbebc2',
          300: '#f7db96',
          400: '#f2c568',
          500: '#efb344',
          600: '#daaf1b',   // Brand gold
          700: '#b8941a',
          800: '#957519',
          900: '#7a611a',
          950: '#47370c',
        },
        teal: {
          50: '#f0fdfb',
          100: '#ccfbf4',
          200: '#99f6ea',
          300: '#5eead9',
          400: '#66d1ba',   // Brand teal
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // Status colors using brand palette
        engage: {
          yes: '#66d1ba',    // Brand teal for positive
          no: '#ef4444',     // Red for negative
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #234071 0%, #66d1ba 100%)',
        'gradient-gold': 'linear-gradient(135deg, #daaf1b 0%, #234071 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}