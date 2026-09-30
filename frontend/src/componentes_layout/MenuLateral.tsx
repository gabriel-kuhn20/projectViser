import { NavLink } from "react-router-dom";

const itensMenu = [
    { rotulo: "Lembretes", rota: "/" },
    { rotulo: "Clientes", rota: "/clientes" },
    { rotulo: "Tags", rota: "/tags" },
    { rotulo: "Painel", rota: "/painel" },
    { rotulo: "Atendentes", rota: "/atendentes" },
];

export function MenuLateral() {
    return (
        <aside className="app-sidebar">
            <div className="app-sidebar-logo">Viser</div>
            <nav className="app-sidebar-nav">
                {itensMenu.map((item) => (
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