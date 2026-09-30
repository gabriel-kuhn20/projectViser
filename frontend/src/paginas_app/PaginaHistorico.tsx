// UC06 · Consultar histórico do cliente / UC07 · Registrar interação
import { HistoricoInteracoes } from "../componentes_interacoes/HistoricoInteracoes";
import { FormularioInteracao } from "../componentes_interacoes/FormularioInteracao";

export function PaginaHistorico() {
  return (
    <div>
      <h2 className="pagina-titulo">Histórico do cliente</h2>
      <div className="flex flex-col gap-4">
        <HistoricoInteracoes />
        <FormularioInteracao />
      </div>
    </div>
  );
}
