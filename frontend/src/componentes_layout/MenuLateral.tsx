import { Link } from "react-router-dom";

export function MenuLateral() {
  return (
    <nav>
      <Link to="/">lembretes</Link>
      <Link to="/clientes">clientes</Link>
      <Link to="/painel">painel</Link>
      <Link to="/atendentes">atendentes</Link>
    </nav>
  );
}
