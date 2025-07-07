/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ✅ 2. ADICIONE A NOVA FAMÍLIA DE FONTES AQUI
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'], // Define 'Quicksand' como a fonte padrão sans-serif
      },
      // Suas outras extensões de cores continuam aqui...
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
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}