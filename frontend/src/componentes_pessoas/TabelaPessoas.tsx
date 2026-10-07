import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { DadosPessoa } from "../servicos_api/ApiPessoa";
import { formatarDataBr } from "../utilitarios_formatacao/FormatarData";

type PropriedadesTabelaPessoas = {
    pessoasCadastradas: DadosPessoa[];
    aoEditar: (pessoa: DadosPessoa) => void;
    aoExcluir: (pessoa: DadosPessoa) => void;
};

// Listar pessoas
export function TabelaPessoas({ pessoasCadastradas, aoEditar, aoExcluir }: PropriedadesTabelaPessoas) {
    if (pessoasCadastradas.length === 0) {
        return <p className="text-muted">nenhuma pessoa cadastrada</p>;
    }

    return (
        <div className="table-responsive">
            <table className="table table-striped align-middle">
                <thead>
                <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>CPF</th>
                    <th>Criada em</th>
                    <th className="text-end">Ações</th>
                </tr>
                </thead>
                <tbody>
                {pessoasCadastradas.map((pessoa) => (
                    <tr key={pessoa.id}>
                        <td>{pessoa.nome}</td>
                        <td>{pessoa.email ?? "—"}</td>
                        <td>{pessoa.cpf ?? "—"}</td>
                        <td>{formatarDataBr(pessoa.criadoEm)}</td>
                        <td className="text-end">
                            <div className="d-inline-flex gap-2">
                                <button type="button" className="botao-link" onClick={() => aoEditar(pessoa)}>
                                    Editar
                                </button>
                                <button type="button" className="botao-perigo" onClick={() => aoExcluir(pessoa)}>
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