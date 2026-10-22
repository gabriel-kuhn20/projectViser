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
                // Site institucional (telas do Figma)
                site: {
                    hero: "#6f6867", // cinza quente do topo com foto
                    cabecalho: "#e7e3e2", // cabeçalho claro (Quem Somos)
                    secao: "#e8e4e3", // fundo cinza claro das seções
                    bege: "#f8e9dd", // fundo bege (15 anos de experiência)
                    claro: "#d6d6d6", // horário: dia claro
                    escuro: "#7b7b7b", // horário: dia escuro
                    topo: "#a3a3a3", // botão voltar ao topo
                    botao: "#444444", // botão "Agende sua consultoria"
                },
            },
            fontFamily: {
                display: ["'Cormorant Garamond'", "serif"],
                sans: ["'Inter'", "system-ui", "sans-serif"],
                montserrat: ["'Montserrat'", "system-ui", "sans-serif"],
                comfortaa: ["'Comfortaa'", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [],
}