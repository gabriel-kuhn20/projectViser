import { useNavigate } from "react-router-dom";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";

export function CabecalhoPrincipal() {
  const { sair } = usarAutenticacao();
  const navegar = useNavigate();

  function sairDoSistema() {
    sair();
    navegar("/login", { replace: true });
  }

  return (
      <header className="navbar navbar-dark bg-dark px-3">
        <span className="navbar-brand mb-0 h1">Sistema de Pós Venda da Ótica</span>
        <BotaoPrimario texto="Sair" variante="outline-light" aoClicar={sairDoSistema} />
      </header>
  );
}