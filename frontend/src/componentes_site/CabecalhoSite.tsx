import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogoViser } from "./LogoViser";
import { IconeFechar, IconeLupa, IconeMenu } from "./IconesSite";

export const paginasSite = [
    { rotulo: "Home", rota: "/" },
    { rotulo: "Quem somos", rota: "/quem-somos" },
    { rotulo: "Visagismo", rota: "/visagismo" },
    { rotulo: "Tendências", rota: "/tendencias" },
];

// índice simples para a lupa: cada termo leva para a página que fala dele
const indiceBusca = [
    { titulo: "Início", rota: "/", termos: "home inicio essencia estilo depoimentos cuidados oculos" },
    { titulo: "Encontre o seu estilo", rota: "/", termos: "classico elegante criativo casual moderno armacoes preco" },
    { titulo: "Quem somos", rota: "/quem-somos", termos: "historia bruna daniela fundadoras experiencia marcas" },
    { titulo: "Nossas lojas", rota: "/quem-somos", termos: "loja endereco localizacao centro sao cristovao lajeado" },
    { titulo: "Visagismo", rota: "/visagismo", termos: "visagismo consultoria analise coloracao harmonias resultado" },
    { titulo: "Tendências", rota: "/tendencias", termos: "tendencias oversized transparente gatinho tartaruga metal geometrico" },
];

function normalizar(texto: string) {
    return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

type PropriedadesCabecalhoSite = {
    // escuro: sobre a foto do topo (Home, Visagismo); claro: fundo cinza claro (Quem Somos)
    variante: "escuro" | "claro";
    mostrarLogo?: boolean;
};

export function CabecalhoSite({ variante, mostrarLogo = true }: PropriedadesCabecalhoSite) {
    const [buscaAberta, definirBuscaAberta] = useState(false);
    const [menuAberto, definirMenuAberto] = useState(false);
    const [termo, definirTermo] = useState("");
    const campoBusca = useRef<HTMLInputElement>(null);
    const navegar = useNavigate();

    const resultados = termo.trim()
        ? indiceBusca.filter((item) =>
              normalizar(`${item.titulo} ${item.termos}`).includes(normalizar(termo.trim()))
          )
        : [];

    useEffect(() => {
        if (buscaAberta) campoBusca.current?.focus();
    }, [buscaAberta]);

    function irPara(rota: string) {
        definirBuscaAberta(false);
        definirTermo("");
        navegar(rota);
    }

    return (
        <header className={`site-cabecalho ${variante === "escuro" ? "site-cabecalho-escuro" : "site-cabecalho-claro"}`}>
            <div className="site-container flex h-[84px] items-center justify-between">
                <Link to="/" className={`shrink-0 ${mostrarLogo ? "" : "md:invisible"}`} aria-label="Viser, página inicial">
                    <LogoViser className="text-[56px]" />
                </Link>

                <nav className="hidden md:flex items-center gap-8 lg:gap-[55px] md:ml-auto md:mr-10 lg:mr-[83px]">
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

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => definirBuscaAberta(!buscaAberta)}
                            className="site-icone-botao"
                            aria-label="Buscar no site"
                            aria-expanded={buscaAberta}
                        >
                            <IconeLupa className="h-[31px] w-[31px]" />
                        </button>
                        {buscaAberta && (
                            <div className="site-busca">
                                <input
                                    ref={campoBusca}
                                    type="search"
                                    value={termo}
                                    onChange={(e) => definirTermo(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && resultados[0]) irPara(resultados[0].rota);
                                        if (e.key === "Escape") definirBuscaAberta(false);
                                    }}
                                    placeholder="O que você procura?"
                                    className="site-busca-campo"
                                />
                                {termo.trim() && (
                                    <ul className="mt-2">
                                        {resultados.length === 0 && (
                                            <li className="px-2 py-1 text-sm text-black/50">Nada encontrado.</li>
                                        )}
                                        {resultados.map((item) => (
                                            <li key={item.titulo}>
                                                <button type="button" onClick={() => irPara(item.rota)} className="site-busca-resultado">
                                                    {item.titulo}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
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
