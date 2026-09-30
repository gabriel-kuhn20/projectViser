import { ReactNode } from "react";
import { MenuLateral } from "./MenuLateral";
import { CabecalhoPrincipal } from "./CabecalhoPrincipal";

// Estrutura visual das telas autenticadas: menu lateral + cabeçalho + conteúdo
export function LayoutPrincipal({ children }: { children: ReactNode }) {
    return (
        <div className="app-shell">
            <MenuLateral />
            <div className="app-content">
                <CabecalhoPrincipal />
                <main className="app-main">{children}</main>
            </div>
        </div>
    );
}