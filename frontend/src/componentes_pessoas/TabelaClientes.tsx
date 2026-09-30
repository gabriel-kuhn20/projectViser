import { type ClienteApi } from "../servicos_api/ApiCliente";

type PropriedadesTabelaClientes = {
  clientes: ClienteApi[];
  carregando: boolean;
  aoEditar: (cliente: ClienteApi) => void;
  aoExcluir: (cliente: ClienteApi) => void;
};

function formatarData(data: string) {
  return new Date(data).toLocaleDateString("pt-BR");
}

// UC02/UC03 · lista de clientes cadastrados
export function TabelaClientes({ clientes, carregando, aoEditar, aoExcluir }: PropriedadesTabelaClientes) {
  if (carregando) {
    return <div className="cartao mt-4 mensagem-vazia">carregando clientes...</div>;
  }

  if (clientes.length === 0) {
    return <div className="cartao mt-4 mensagem-vazia">nenhum cliente cadastrado ainda.</div>;
  }

  return (
      <div className="cartao mt-4 tabela-wrapper">
        <table className="tabela">
          <thead>
          <tr>
            <th>Nome</th>
            <th>Contato</th>
            <th>Endereço</th>
            <th>Cadastrado em</th>
            <th>Ações</th>
          </tr>
          </thead>
          <tbody>
          {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.pessoa.nome}</td>
                <td>{cliente.contato}</td>
                <td>{cliente.endereco || "—"}</td>
                <td>{formatarData(cliente.criadoEm)}</td>
                <td>
                  <div className="flex gap-2">
                    <button type="button" className="botao-link" onClick={() => aoEditar(cliente)}>
                      Editar
                    </button>
                    <button type="button" className="botao-perigo" onClick={() => aoExcluir(cliente)}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
}