/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        background: '#09090b', // Zinc 950
        surface: '#18181b', // Zinc 900
        surfaceHighlight: '#27272a', // Zinc 800
        borderSubtle: '#3f3f46', // Zinc 700
      }
    },
  },
  plugins: [],
}
