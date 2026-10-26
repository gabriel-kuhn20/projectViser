import { type EntregaApi } from "../servicos_api/ApiCliente";
import { formatarDataSemHora } from "../utilitarios_formatacao/FormatarData";

type PropriedadesListaEntregas = {
  entregasCliente: EntregaApi[];
};

// RF18: entregas do cliente (data e produto), da mais recente para a mais antiga — a API já ordena
export function ListaEntregas({ entregasCliente }: PropriedadesListaEntregas) {
  if (entregasCliente.length === 0) {
    return <p className="mensagem-vazia">nenhuma entrega registrada.</p>;
  }

  return (
      <div className="tabela-wrapper">
        <table className="tabela">
          <thead>
          <tr>
            <th>Entregue em</th>
            <th>Produto</th>
          </tr>
          </thead>
          <tbody>
          {entregasCliente.map((entregaCliente) => (
              <tr key={entregaCliente.id}>
                <td>{formatarDataSemHora(entregaCliente.dataEntrega)}</td>
                <td>{entregaCliente.produto}</td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
}
