// UC06 · Consultar histórico do cliente / UC07 · Registrar interação
import { HistoricoInteracoes } from "../componentes_interacoes/HistoricoInteracoes";
import { FormularioInteracao } from "../componentes_interacoes/FormularioInteracao";

export function PaginaHistorico() {
  return (
    <div>
      <HistoricoInteracoes />
      <FormularioInteracao />
    </div>
  );
}
