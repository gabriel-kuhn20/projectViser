import { Link } from "react-router-dom";
import { type ClienteApi } from "../servicos_api/ApiCliente";
import { EtiquetasCliente } from "../componentes_tags/EtiquetasCliente";
import { formatarTelefone } from "../utilitarios_formatacao/FormatarTelefone";

type PropriedadesTabelaClientes = {
  clientes: ClienteApi[];
  carregando: boolean;
  aoExcluir: (cliente: ClienteApi) => void;
  exclusaoPermitida: boolean;
  // com busca ou filtro de tag ativo, "nenhum cliente cadastrado" daria a entender que a base está vazia
  filtroAtivo?: boolean;
};

function formatarData(data: string) {
  return new Date(data).toLocaleDateString("pt-BR");
}

// UC02/UC03 · lista de clientes cadastrados
export function TabelaClientes({
  clientes,
  carregando,
  aoExcluir,
  exclusaoPermitida,
  filtroAtivo = false,
}: PropriedadesTabelaClientes) {
  if (carregando) {
    return <div className="cartao mt-6 mensagem-vazia">carregando clientes...</div>;
  }

  if (clientes.length === 0 && filtroAtivo) {
    return <div className="cartao mt-6 mensagem-vazia">nenhum cliente encontrado com esses filtros.</div>;
  }

  if (clientes.length === 0) {
    return <div className="cartao mt-6 mensagem-vazia">nenhum cliente cadastrado ainda.</div>;
  }

  return (
      <div className="cartao mt-6 tabela-wrapper">
        <table className="tabela">
          <thead>
          <tr>
            <th>Nome</th>
            <th>Contato</th>
            <th>Endereço</th>
            <th className="text-right">Ações</th>
          </tr>
          </thead>
          <tbody>
          {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>
                  <span className="block font-semibold">{cliente.pessoa.nome}</span>
                  <span className="mt-0.5 block text-[12px] text-black/50">desde {formatarData(cliente.criadoEm)}</span>
                  <EtiquetasCliente tagsCliente={cliente.tags} />
                </td>
                <td className="whitespace-nowrap">{formatarTelefone(cliente.contato)}</td>
                <td className="whitespace-normal">
                  <span className="block min-w-[160px] max-w-[260px]">{cliente.endereco || "—"}</span>
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    {/* RF18: a tela do cliente reúne dados, entregas e histórico — a edição também fica lá */}
                    <Link to={`/historico/${cliente.id}`} className="botao-link">
                      Ver cliente
                    </Link>
                      {exclusaoPermitida && (
                      <button type="button" className="botao-perigo" onClick={() => aoExcluir(cliente)}>
                        Excluir
                      </button>
                    )}
                  </div>
                </td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
}