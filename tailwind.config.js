/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        title: ['"Montserrat Alternates"', 'sans-serif'],
      },
      colors: {
        primary: "#1E40AF", // Azul personalizado para resaltar elementos importantes
        secondary: "#6B7280", // Gris oscuro para textos secundarios
        success: "#16A34A", // Verde para estados de éxito
        danger: "#DC2626", // Rojo para estados de error
      },
      boxShadow: {
        custom: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Sombra personalizada
      },
    },
  },
  plugins: [],
};