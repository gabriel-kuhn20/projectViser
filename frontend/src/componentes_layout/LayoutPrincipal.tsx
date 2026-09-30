import { Outlet } from "react-router-dom";
import { CabecalhoPrincipal } from "./CabecalhoPrincipal";
import { MenuLateral } from "./MenuLateral";

// moldura das telas autenticadas: cabeçalho + menu + conteúdo da rota
export function LayoutPrincipal() {
    return (
        <div className="d-flex flex-column min-vh-100">
            <CabecalhoPrincipal />
            <div className="d-flex flex-grow-1">
                <aside className="bg-light border-end flex-shrink-0" style={{ width: 220 }}>
                    <MenuLateral />
                </aside>
                <main className="flex-grow-1 p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}