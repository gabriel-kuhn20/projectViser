import { type AtendenteApi } from "../servicos_api/ApiAtendente";

type PropriedadesTabelaAtendentes = {
    atendentes: AtendenteApi[];
    carregando: boolean;
    aoEditar: (atendente: AtendenteApi) => void;
    aoExcluir: (atendente: AtendenteApi) => void;
};

function formatarData(data: string) {
    return new Date(data).toLocaleDateString("pt-BR");
}

// contas da equipe que acessam o sistema
export function TabelaAtendentes({ atendentes, carregando, aoEditar, aoExcluir }: PropriedadesTabelaAtendentes) {
    if (carregando) {
        return <div className="cartao mensagem-vazia">carregando contas...</div>;
    }

    if (atendentes.length === 0) {
        return <div className="cartao mensagem-vazia">nenhuma conta cadastrada ainda.</div>;
    }

    return (
        <div className="cartao tabela-wrapper">
            <table className="tabela">
                <thead>
                    <tr>
                        <th>Conta</th>
                        <th>Papel</th>
                        <th className="text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {atendentes.map((atendente) => (
                        <tr key={atendente.id}>
                            <td>
                                <span className="block font-semibold">{atendente.pessoa.nome}</span>
                                <span className="mt-0.5 block text-[12px] text-black/55">{atendente.email}</span>
                                <span className="block text-[12px] text-black/40">desde {formatarData(atendente.criadoEm)}</span>
                            </td>
                            <td>
                                <span className={`etiqueta ${atendente.papelAcesso === "admin" ? "etiqueta-escura" : ""}`}>
                                    {atendente.papelAcesso === "admin" ? "Administrador" : "Atendente"}
                                </span>
                            </td>
                            <td>
                                <div className="flex justify-end gap-2">
                                    <button type="button" className="botao-link" onClick={() => aoEditar(atendente)}>
                                        Editar
                                    </button>
                                    <button type="button" className="botao-perigo" onClick={() => aoExcluir(atendente)}>
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
