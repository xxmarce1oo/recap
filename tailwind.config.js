/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
    safelist: [
    'bg-blue-500',
    'bg-green-500',
    'bg-red-500',
    'bg-gray-500',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712' // Adicionando um tom extra escuro
        }
      },
      // ✅ NOVA SEÇÃO DE ANIMAÇÃO
      keyframes: {
        'gentle-bounce': {
          '0%, 100%': {
            transform: 'translateY(-10%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
          },
        }
      },
      animation: {
        'gentle-bounce': 'gentle-bounce 2s infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // Verifique se este plugin está aqui, caso use a classe 'prose'
  ],
  darkMode: 'class',
}