/** @type {import('tailwindcss').Config} */
export default {
  content: [ "./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}", ],
  theme: {
    extend: {
      colors: {
        'primary': '#2563EB',
        'secondary': '#10B981',
        'light-gray': '#F3F4F6',
        'text-dark': '#1F2937',
        'text-light': '#6B7280',
        'danger': '#EF4444',
        // --- Paleta de Colores del Odontograma ---
        'purple-endo': '#8B5CF6',
        'gray-implant': '#6B7280',
        'orange-fracture': '#F97316',
        'orange-defective': '#F59E0B', // <-- AÑADE ESTE NUEVO COLOR
        'pink-temp': '#EC4899',
        'brown-dischromia': '#78350F',
        'yellow-sealant': '#F59E0B',
        'teal-super': '#14B8A6',
        'purple-defective': '#5B21B6', // Morado oscuro para obturado defectuoso
        'teal-defective': '#0D9488',
      }
    },
  },
  plugins: [],
}