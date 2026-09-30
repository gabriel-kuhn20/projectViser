import { useNavigate } from "react-router-dom";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";

export function CabecalhoPrincipal() {
  const { sair } = usarAutenticacao();
  const navegar = useNavigate();

  function aoClicarSair() {
    sair();
    navegar("/login", { replace: true });
  }

  return (
    <header className="app-header flex items-center justify-between">
      <h1 className="text-lg font-medium text-viser-950">Sistema de Pós Venda da Ótica</h1>
      <button type="button" onClick={aoClicarSair} className="botao-secundario">
        Sair
      </button>
    </header>
  );
}
