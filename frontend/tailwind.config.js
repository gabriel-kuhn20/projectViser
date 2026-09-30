/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                // Paleta baseada no site institucional da Viser (Figma)
                viser: {
                    950: "#160d0b", // fundo escuro principal
                    900: "#20130f",
                    800: "#2c1a15",
                    700: "#3d251e",
                    creme: "#f6efe6", // texto/fundo claro
                    creme2: "#ece2d4",
                },
            },
            fontFamily: {
                display: ["'Cormorant Garamond'", "serif"],
                sans: ["'Inter'", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [],
}