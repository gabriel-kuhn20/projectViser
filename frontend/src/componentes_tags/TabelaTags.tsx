import { type TagApi } from "../servicos_api/ApiTag";

type PropriedadesTabelaTags = {
  tags: TagApi[];
  carregando: boolean;
  aoEditar: (tag: TagApi) => void;
  aoExcluir: (tag: TagApi) => void;
};

function formatarData(data: string) {
  return new Date(data).toLocaleDateString("pt-BR");
}

export function TabelaTags({ tags, carregando, aoEditar, aoExcluir }: PropriedadesTabelaTags) {
  if (carregando) {
    return <div className="cartao mt-4 mensagem-vazia">carregando tags...</div>;
  }

  if (tags.length === 0) {
    return <div className="cartao mt-4 mensagem-vazia">nenhuma tag cadastrada ainda.</div>;
  }

  return (
    <div className="cartao mt-4 tabela-wrapper max-w-sm">
      <table className="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Criada em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <tr key={tag.id}>
              <td>{tag.nome}</td>
              <td>{formatarData(tag.criadoEm)}</td>
              <td>
                <div className="flex gap-2">
                  <button type="button" className="botao-link" onClick={() => aoEditar(tag)}>
                    Editar
                  </button>
                  <button type="button" className="botao-perigo" onClick={() => aoExcluir(tag)}>
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
