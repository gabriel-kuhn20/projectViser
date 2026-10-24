import { useNavigate } from "react-router-dom";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";
import { LogoViser } from "../componentes_site/LogoViser";
import { IconeMenu } from "../componentes_site/IconesSite";
import { IconeSair } from "./IconesMenu";

type PropriedadesCabecalhoPrincipal = {
    aoAbrirMenu: () => void;
};

export function CabecalhoPrincipal({ aoAbrirMenu }: PropriedadesCabecalhoPrincipal) {
    const { sair, papelAcesso } = usarAutenticacao();
    const navegar = useNavigate();

    function aoClicarSair() {
        sair();
        navegar("/login", { replace: true });
    }

    return (
        <header className="app-header">
            <div className="flex items-center gap-3">
                <button type="button" onClick={aoAbrirMenu} className="-ml-2 p-2 md:hidden" aria-label="Abrir menu">
                    <IconeMenu className="h-6 w-6" />
                </button>
                <LogoViser className="h-[28px] w-auto md:hidden" />
                <span className="hidden font-comfortaa text-[15px] text-black/70 md:inline">Sistema de pós-venda da ótica</span>
            </div>
            <div className="flex items-center gap-3">
                {papelAcesso && (
                    <span className={`etiqueta hidden sm:inline-flex ${papelAcesso === "admin" ? "etiqueta-escura" : ""}`}>
                        {papelAcesso === "admin" ? "Administrador" : "Atendente"}
                    </span>
                )}
                <button type="button" onClick={aoClicarSair} className="botao-secundario h-[38px] gap-2 px-4">
                    <IconeSair className="h-[16px] w-[16px]" />
                    Sair
                </button>
            </div>
        </header>
    );
}
