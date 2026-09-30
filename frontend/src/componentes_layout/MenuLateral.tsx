import { NavLink } from "react-router-dom";

function obterClasseLink({ isActive }: { isActive: boolean }) {
    return isActive ? "nav-link active" : "nav-link";
}

export function MenuLateral() {
    return (
        <nav className="nav nav-pills flex-column p-3">
            <NavLink to="/" end className={obterClasseLink}>lembretes</NavLink>
            <NavLink to="/clientes" className={obterClasseLink}>clientes</NavLink>
            <NavLink to="/pessoas" className={obterClasseLink}>pessoas</NavLink>
            <NavLink to="/tags" className={obterClasseLink}>tags</NavLink>
            <NavLink to="/painel" className={obterClasseLink}>painel</NavLink>
            <NavLink to="/atendentes" className={obterClasseLink}>atendentes</NavLink>
        </nav>
    );
}