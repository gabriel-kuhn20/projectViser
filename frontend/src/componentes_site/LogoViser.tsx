type PropriedadesLogo = { className?: string };

// Provisório: escreve "Viser" numa serifa parecida com a marca.
// Quando o SVG do logo for exportado do Figma, troque este conteúdo por:
//   <img src={logoViser} alt="Viser" className={className} />
export function LogoViser({ className = "" }: PropriedadesLogo) {
    return (
        <span className={`site-logo ${className}`} aria-label="Viser">
            Viser
        </span>
    );
}
