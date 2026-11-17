import { type AtendenteApi } from "../servicos_api/ApiAtendente";

type PropriedadesTabelaAtendentes = {
    atendentes: AtendenteApi[];
    carregando: boolean;
    aoEditar: (atendente: AtendenteApi) => void;
    aoEnviarLinkSenha: (atendente: AtendenteApi) => void;
    aoExcluir: (atendente: AtendenteApi) => void;
    aoAlternarSituacao: (atendente: AtendenteApi) => void;
    // com busca ativa, "nenhuma conta cadastrada" daria a entender que a equipe está vazia
    filtroAtivo?: boolean;
};

function formatarData(data: string) {
    return new Date(data).toLocaleDateString("pt-BR");
}

// contas da equipe que acessam o sistema
export function TabelaAtendentes({
    atendentes,
    carregando,
    aoEditar,
    aoEnviarLinkSenha,
    aoExcluir,
    aoAlternarSituacao,
    filtroAtivo = false,
}: PropriedadesTabelaAtendentes) {
    if (carregando) {
        return <div className="cartao mensagem-vazia">carregando contas...</div>;
    }

    if (atendentes.length === 0 && filtroAtivo) {
        return <div className="cartao mensagem-vazia">nenhuma conta encontrada para essa busca.</div>;
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
                        // conta desativada fica na lista, apagada, para o admin poder reativar
                        <tr key={atendente.id} className={atendente.ativo ? "" : "opacity-60"}>
                            <td>
                                <span className="block font-semibold">{atendente.pessoa.nome}</span>
                                <span className="mt-0.5 block text-[12px] text-black/55">{atendente.email}</span>
                                <span className="block text-[12px] text-black/40">desde {formatarData(atendente.criadoEm)}</span>
                            </td>
                            <td>
                                <div className="flex flex-wrap gap-2">
                                    <span className={`etiqueta ${atendente.papelAcesso === "admin" ? "etiqueta-escura" : ""}`}>
                                        {atendente.papelAcesso === "admin" ? "Administrador" : "Atendente"}
                                    </span>
                                    {!atendente.ativo && <span className="etiqueta etiqueta-alerta">Desativada</span>}
                                </div>
                            </td>
                            <td>
                                <div className="flex justify-end gap-2">
                                    <button type="button" className="botao-link" onClick={() => aoEditar(atendente)}>
                                        Editar
                                    </button>
{/* UC14 · Enviar à pessoa o link para criar uma senha nova (RF22) */}
                                    {/* escondido em conta desativada: o servidor recusa, porque o link devolveria o acesso tirado */}
                                    {atendente.ativo && (
                                        <button type="button" className="botao-link" onClick={() => aoEnviarLinkSenha(atendente)}>
                                            Enviar link de senha
                                        </button>
                                    )}
                                    <button type="button" className="botao-link" onClick={() => aoAlternarSituacao(atendente)}>
                                        {atendente.ativo ? "Desativar" : "Reativar"}
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
