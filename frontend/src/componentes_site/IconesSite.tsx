// Ícones do site desenhados em SVG simples (herdam a cor do texto)
type PropriedadesIcone = { className?: string };

export function IconeSetaDireita({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
            <line x1="4" y1="12" x2="19" y2="12" />
            <polyline points="13 6 19 12 13 18" />
        </svg>
    );
}

export function IconeSetaVertical({ className = "", direcao = "cima" }: PropriedadesIcone & { direcao?: "cima" | "baixo" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${className} ${direcao === "baixo" ? "rotate-180" : ""}`} aria-hidden="true">
            <line x1="12" y1="20" x2="12" y2="4" />
            <polyline points="6 10 12 4 18 10" />
        </svg>
    );
}

export function IconeMaisCirculo({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={className} aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <polyline points="11 8 15 12 11 16" strokeLinejoin="round" />
            <line x1="8" y1="12" x2="15" y2="12" />
        </svg>
    );
}

export function IconeChevron({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
            <polyline points="9 5 16 12 9 19" />
        </svg>
    );
}

export function IconeTriangulo({ className = "", direcao = "direita" }: PropriedadesIcone & { direcao?: "esquerda" | "direita" }) {
    return (
        <svg viewBox="0 0 24 28" fill="currentColor" className={`${className} ${direcao === "esquerda" ? "rotate-180" : ""}`} aria-hidden="true">
            <path d="M4 3.5c0-2 2.2-3.2 3.9-2.1l14 10.5c1.4 1 1.4 3.1 0 4.2l-14 10.5C6.2 27.7 4 26.5 4 24.5z" />
        </svg>
    );
}

export function IconePlay({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 72 72" className={className} aria-hidden="true">
            <circle cx="36" cy="36" r="36" fill="currentColor" />
            <path d="M28 21.5c0-1.9 2-3 3.6-2l20 13.2c1.4 1 1.4 3.1 0 4L31.6 50c-1.6 1-3.6-.1-3.6-2z" fill="#fff" />
        </svg>
    );
}

export function IconeOculos({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 80 36" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinejoin="round" className={className} aria-hidden="true">
            <path d="M4 7c10-3 22-3 30 0 0 12-4 25-15 25S3 21 4 7z" />
            <path d="M76 7c-10-3-22-3-30 0 0 12 4 25 15 25s16-11 15-25z" />
            <path d="M34 9c4-2 8-2 12 0" />
        </svg>
    );
}

export function IconePessoas({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 72 40" fill="currentColor" className={className} aria-hidden="true">
            <circle cx="36" cy="9" r="8" fill="none" stroke="currentColor" strokeWidth="4" />
            <path d="M22 39c0-9 6-15 14-15s14 6 14 15z" />
            <circle cx="14" cy="16" r="6" />
            <path d="M2 39c0-7 5-12 12-12 3 0 5 1 7 2-2 3-3 6-3 10z" />
            <circle cx="58" cy="16" r="6" />
            <path d="M70 39c0-7-5-12-12-12-3 0-5 1-7 2 2 3 3 6 3 10z" />
        </svg>
    );
}

export function IconeEstrela({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 40 38" fill="currentColor" className={className} aria-hidden="true">
            <path d="M20 0l5.9 12.6 13.6 1.6-10 9.4 2.6 13.5L20 30.4 7.9 37.1l2.6-13.5-10-9.4 13.6-1.6z" />
        </svg>
    );
}

export function IconeMedalha({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 28 40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" className={className} aria-hidden="true">
            <circle cx="14" cy="12" r="10" />
            <path d="M8 20.5V38l6-5 6 5V20.5" />
        </svg>
    );
}

export function IconeInstagram({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4.2" />
            <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
        </svg>
    );
}

export function IconeWhatsapp({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className={className} aria-hidden="true">
            <path d="M3.5 20.5l1.3-4.2A8.6 8.6 0 1 1 8 19.4z" />
            <path
                d="M9 7.6c.3-.3.8-.3 1 .1l.8 1.7c.1.3 0 .6-.2.8l-.6.6c.6 1.3 1.7 2.4 3 3l.6-.6c.2-.2.5-.3.8-.2l1.7.8c.4.2.4.7.1 1-.6.8-1.6 1.2-2.6.9-2.5-.8-4.5-2.8-5.3-5.3-.3-1 .1-2 .7-2.8z"
                fill="currentColor"
                stroke="none"
            />
        </svg>
    );
}

export function IconeMenu({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
    );
}

export function IconeFechar({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
    );
}
