// Ícones do menu do sistema, no mesmo traço fino dos ícones do site (herdam a cor do texto)
type PropriedadesIcone = { className?: string };

const tracoPadrao = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
};

export function IconeLembretes({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 24 24" {...tracoPadrao} className={className} aria-hidden="true">
            <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
            <path d="M10.3 20a1.9 1.9 0 0 0 3.4 0" />
        </svg>
    );
}

export function IconeClientes({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 24 24" {...tracoPadrao} className={className} aria-hidden="true">
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
            <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" />
            <path d="M18 14.3c2.1.7 3.5 2.8 3.5 5.7" />
        </svg>
    );
}

export function IconeTags({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 24 24" {...tracoPadrao} className={className} aria-hidden="true">
            <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" />
            <circle cx="7.5" cy="7.5" r="1.3" />
        </svg>
    );
}

export function IconePainel({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 24 24" {...tracoPadrao} className={className} aria-hidden="true">
            <rect x="3" y="3" width="7.5" height="9" rx="1.5" />
            <rect x="13.5" y="3" width="7.5" height="5" rx="1.5" />
            <rect x="13.5" y="11" width="7.5" height="10" rx="1.5" />
            <rect x="3" y="15" width="7.5" height="6" rx="1.5" />
        </svg>
    );
}

export function IconeAtendentes({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 24 24" {...tracoPadrao} className={className} aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
        </svg>
    );
}

export function IconeSair({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 24 24" {...tracoPadrao} className={className} aria-hidden="true">
            <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
            <path d="M10 17l-5-5 5-5" />
            <path d="M5 12h11" />
        </svg>
    );
}

export function IconeVoltar({ className = "" }: PropriedadesIcone) {
    return (
        <svg viewBox="0 0 24 24" {...tracoPadrao} className={className} aria-hidden="true">
            <path d="M20 12H5" />
            <path d="M11 6l-6 6 6 6" />
        </svg>
    );
}
