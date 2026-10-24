import { Link, NavLink } from "react-router-dom";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";
import { LogoViser } from "../componentes_site/LogoViser";
import { IconeAtendentes, IconeClientes, IconeLembretes, IconePainel, IconeTags } from "./IconesMenu";

export const itensMenu = [
    { rotulo: "Lembretes", rota: "/lembretes", restritoAdmin: false, Icone: IconeLembretes },
    { rotulo: "Clientes", rota: "/clientes", restritoAdmin: false, Icone: IconeClientes },
    { rotulo: "Painel", rota: "/painel", restritoAdmin: false, Icone: IconePainel },
    { rotulo: "Tags", rota: "/tags", restritoAdmin: true, Icone: IconeTags },
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
            <Link to="/lembretes" className="app-sidebar-logo" aria-label="Viser, início do sistema" onClick={aoNavegar}>
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
