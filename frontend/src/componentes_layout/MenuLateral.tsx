import { NavLink } from "react-router-dom";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";

const itensMenu = [
    { rotulo: "Lembretes", rota: "/", restritoAdmin: false },
    { rotulo: "Clientes", rota: "/clientes", restritoAdmin: false },
    { rotulo: "Tags", rota: "/tags", restritoAdmin: false },
    { rotulo: "Painel", rota: "/painel", restritoAdmin: false },
    { rotulo: "Atendentes", rota: "/atendentes", restritoAdmin: true },
];

export function MenuLateral() {
    const { papelAcesso } = usarAutenticacao();
    const itensPermitidos = itensMenu.filter((item) => !item.restritoAdmin || papelAcesso === "admin");

    return (
        <aside className="app-sidebar">
            <div className="app-sidebar-logo">Viser</div>
            <nav className="app-sidebar-nav">
                {itensPermitidos.map((item) => (
                    <NavLink
                        key={item.rota}
                        to={item.rota}
                        end={item.rota === "/"}
                        className={({ isActive }) =>
                            `app-sidebar-link ${isActive ? "ativo" : ""}`
                        }
                    >
                        {item.rotulo}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}