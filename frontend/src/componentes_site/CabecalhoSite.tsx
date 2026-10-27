import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { LogoViser } from "./LogoViser";
import { IconeFechar, IconeMenu } from "./IconesSite";

export const paginasSite = [
    { rotulo: "Home", rota: "/" },
    { rotulo: "Quem somos", rota: "/quem-somos" },
    { rotulo: "Visagismo", rota: "/visagismo" },
    { rotulo: "Tendências", rota: "/tendencias" },
];

type PropriedadesCabecalhoSite = {
    // escuro: sobre a foto do topo (Home, Visagismo); claro: fundo cinza claro (Quem Somos)
    variante: "escuro" | "claro";
    mostrarLogo?: boolean;
};

export function CabecalhoSite({ variante, mostrarLogo = true }: PropriedadesCabecalhoSite) {
    const [menuAberto, definirMenuAberto] = useState(false);

    return (
        <header className={`site-cabecalho ${variante === "escuro" ? "site-cabecalho-escuro" : "site-cabecalho-claro"}`}>
            <div className="site-container flex h-[84px] items-center justify-between">
                <Link to="/" className={`shrink-0 ${mostrarLogo ? "" : "md:invisible"}`} aria-label="Viser, página inicial">
                    <LogoViser className="h-[44px] w-auto md:h-[48px]" />
                </Link>

                <nav className="hidden md:flex items-center gap-8 lg:gap-[55px] md:ml-auto">
                    {paginasSite.map((pagina) => (
                        <NavLink
                            key={pagina.rota}
                            to={pagina.rota}
                            end={pagina.rota === "/"}
                            className={({ isActive }) => `site-menu-link ${isActive ? "ativo" : ""}`}
                        >
                            {pagina.rotulo}
                        </NavLink>
                    ))}
                </nav>

                <button
                    type="button"
                    onClick={() => definirMenuAberto(!menuAberto)}
                    className="site-icone-botao md:hidden"
                    aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
                    aria-expanded={menuAberto}
                >
                    {menuAberto ? <IconeFechar className="h-7 w-7" /> : <IconeMenu className="h-7 w-7" />}
                </button>
            </div>

            {menuAberto && (
                <nav className="site-menu-celular md:hidden">
                    {paginasSite.map((pagina) => (
                        <NavLink
                            key={pagina.rota}
                            to={pagina.rota}
                            end={pagina.rota === "/"}
                            onClick={() => definirMenuAberto(false)}
                            className={({ isActive }) => `site-menu-link py-3 ${isActive ? "ativo" : ""}`}
                        >
                            {pagina.rotulo}
                        </NavLink>
                    ))}
                </nav>
            )}
        </header>
    );
}
