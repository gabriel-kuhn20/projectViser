import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CabecalhoSite } from "./CabecalhoSite";
import { RodapeSite } from "./RodapeSite";
import { BotaoTopo } from "./BotaoTopo";

type PropriedadesLayoutSite = {
    titulo: string;
    // "sobreposto": cabeçalho escuro por cima da foto do topo; "claro": cabeçalho cinza claro acima do conteúdo
    cabecalho: "sobreposto" | "claro";
    mostrarLogo?: boolean;
    children: React.ReactNode;
};

// Estrutura comum das páginas públicas: cabeçalho, conteúdo, rodapé e botão de rolagem
export function LayoutSite({ titulo, cabecalho, mostrarLogo = true, children }: PropriedadesLayoutSite) {
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = `${titulo} · Viser`;
    }, [titulo]);

    // ao trocar de página, começa do topo (o React Router mantém a rolagem anterior)
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="site">
            <div className={cabecalho === "sobreposto" ? "absolute inset-x-0 top-0 z-30" : "sticky top-0 z-30"}>
                <CabecalhoSite variante={cabecalho === "sobreposto" ? "escuro" : "claro"} mostrarLogo={mostrarLogo} />
            </div>
            <main>{children}</main>
            <RodapeSite />
            <BotaoTopo />
        </div>
    );
}
