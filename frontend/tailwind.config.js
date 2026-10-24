/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                // Paleta baseada no site institucional da Viser (Figma)
                viser: {
                    950: "#000000", // preto da marca
                    900: "#1c1c1c",
                    800: "#3a3a3a",
                    700: "#6b6b6b",
                    creme: "#f6f5f3", // fundo claro
                    creme2: "#e7e3e2", // bordas e divisórias
                    bege: "#e4e1da", // bege do manual da marca
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
                // Sistema de pós-venda
                app: {
                    fundo: "#f6f5f3", // fundo das telas internas, para os cartões brancos se destacarem
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