import { useEffect, useState } from "react";
import { IconeSetaVertical } from "./IconesSite";

// Botão cinza fixo no canto: no início da página aponta para baixo (rola uma tela),
// depois de rolar aponta para cima (volta ao topo), como nas telas do Figma
export function BotaoTopo() {
    const [noInicio, definirNoInicio] = useState(true);

    useEffect(() => {
        function aoRolar() {
            definirNoInicio(window.scrollY < window.innerHeight * 0.6);
        }
        aoRolar();
        window.addEventListener("scroll", aoRolar, { passive: true });
        return () => window.removeEventListener("scroll", aoRolar);
    }, []);

    function aoClicar() {
        if (noInicio) window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
        else window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <button
            type="button"
            onClick={aoClicar}
            className="site-botao-topo"
            aria-label={noInicio ? "Rolar para baixo" : "Voltar ao topo"}
        >
            <IconeSetaVertical direcao={noInicio ? "baixo" : "cima"} className="h-7 w-7" />
        </button>
    );
}
