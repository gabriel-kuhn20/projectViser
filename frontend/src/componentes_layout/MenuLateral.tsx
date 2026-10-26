import { Link, NavLink } from "react-router-dom";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";
import { LogoViser } from "../componentes_site/LogoViser";
import { IconeAtendentes, IconeClientes, IconeLembretes, IconeMarcos, IconePainel, IconeTags } from "./IconesMenu";

// RF19: o painel é a tela inicial, por isso vem primeiro no menu
export const itensMenu = [
    { rotulo: "Painel", rota: "/painel", restritoAdmin: false, Icone: IconePainel },
    { rotulo: "Lembretes", rota: "/lembretes", restritoAdmin: false, Icone: IconeLembretes },
    { rotulo: "Clientes", rota: "/clientes", restritoAdmin: false, Icone: IconeClientes },
    { rotulo: "Tags", rota: "/tags", restritoAdmin: true, Icone: IconeTags },
    { rotulo: "Marcos", rota: "/marcos", restritoAdmin: true, Icone: IconeMarcos },
    { rotulo: "Atendentes", rota: "/atendentes", restritoAdmin: true, Icone: IconeAtendentes },
];

type PropriedadesMenuLateral = {
    // no celular o menu abre como gaveta; o clique em um item fecha a gaveta
    aoNavegar?: () => void;
    className?: string;
};

export function MenuLateral({ aoNavegar, className = "" }: PropriedadesMenuLateral) {
    const { papelAcesso } = usarAutenticacao();
    const itensPermitidos = itensMenu.filter((item) => !item.restritoAdmin || papelAcesso === "admin");

    return (
        <aside className={`app-sidebar ${className}`}>
            <Link to="/painel" className="app-sidebar-logo" aria-label="Viser, início do sistema" onClick={aoNavegar}>
                <LogoViser className="h-[40px] w-auto" />
                <span className="mt-3 block font-comfortaa text-[12px] text-white/50">Pós-venda</span>
            </Link>
            <nav className="app-sidebar-nav" aria-label="Menu do sistema">
                {itensPermitidos.map(({ rotulo, rota, Icone }) => (
                    <NavLink
                        key={rota}
                        to={rota}
                        onClick={aoNavegar}
                        className={({ isActive }) => `app-sidebar-link ${isActive ? "ativo" : ""}`}
                    >
                        <Icone className="h-[19px] w-[19px] shrink-0" />
                        {rotulo}
                    </NavLink>
                ))}
            </nav>
            <div className="app-sidebar-rodape">
                <Link to="/" className="hover:text-white transition-colors">
                    Ver site da Viser
                </Link>
            </div>
        </aside>
    );
}
