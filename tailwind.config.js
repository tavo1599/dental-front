/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#2563EB',
        'secondary': '#10B981',
        'light-gray': '#F3F4F6',
        'text-dark': '#1F2937',
        'text-light': '#6B7280',
        'danger': '#EF4444',
        'purple-endo': '#8B5CF6',
        'gray-implant': '#6B7280',
        'orange-fracture': '#F97316'
      }
    },
  },
  plugins: [],
}