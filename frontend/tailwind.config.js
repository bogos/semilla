/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2D5016",
        accent: "#D4AF37",
        beige: "#E8DCC4",
        dark: "#1A1A1A",
        light: "#F5F5F5",
      },
    },
  },
  plugins: [],
}
