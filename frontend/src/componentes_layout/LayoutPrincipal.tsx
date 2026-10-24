import { ReactNode, useState } from "react";
import { MenuLateral } from "./MenuLateral";
import { CabecalhoPrincipal } from "./CabecalhoPrincipal";
import { IconeFechar } from "../componentes_site/IconesSite";

// Estrutura visual das telas autenticadas: menu lateral + cabeçalho + conteúdo
// no celular o menu vira uma gaveta aberta pelo botão do cabeçalho
export function LayoutPrincipal({ children }: { children: ReactNode }) {
    const [menuAberto, definirMenuAberto] = useState(false);

    return (
        <div className="app-shell">
            <MenuLateral />

            {menuAberto && (
                <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Menu do sistema">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/50"
                        aria-label="Fechar menu"
                        onClick={() => definirMenuAberto(false)}
                    />
                    <div className="relative h-full w-[260px]">
                        <MenuLateral className="!flex h-full" aoNavegar={() => definirMenuAberto(false)} />
                        <button
                            type="button"
                            onClick={() => definirMenuAberto(false)}
                            className="absolute right-3 top-4 p-2 text-white"
                            aria-label="Fechar menu"
                        >
                            <IconeFechar className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            )}

            <div className="app-content">
                <CabecalhoPrincipal aoAbrirMenu={() => definirMenuAberto(true)} />
                <main className="app-main">{children}</main>
            </div>
        </div>
    );
}
