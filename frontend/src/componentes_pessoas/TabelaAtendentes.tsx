import { type AtendenteApi } from "../servicos_api/ApiAtendente";
import { IconeLixeira } from "../componentes_layout/IconesMenu";

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
// Lista e não `<table>` de propósito: cada linha quebra sozinha (dados em cima, botões embaixo)
// quando falta espaço, então todos os botões aparecem em qualquer largura, sem rolagem lateral
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
        <ul className="cartao divide-y divide-black/10 p-0">
            {atendentes.map((atendente) => {
                const nomePapel = atendente.papelAcesso === "admin" ? "Administrador" : "Atendente";

                return (
                    // conta desativada fica na lista, apagada, para o admin poder reativar
                    <li
                        key={atendente.id}
                        className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 ${atendente.ativo ? "" : "opacity-60"}`}
                    >
                        <div className="min-w-0 flex-1 basis-[220px]">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold">{atendente.pessoa.nome}</span>
                                <span className={`etiqueta ${atendente.papelAcesso === "admin" ? "etiqueta-escura" : ""}`}>
                                    {nomePapel}
                                </span>
                                {!atendente.ativo && <span className="etiqueta etiqueta-alerta">Desativada</span>}
                            </div>
                            <span className="mt-0.5 block break-words text-[12px] text-black/55">{atendente.email}</span>
                            <span className="block text-[12px] text-black/40">desde {formatarData(atendente.criadoEm)}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button type="button" className="botao-link" onClick={() => aoEditar(atendente)}>
                                Editar
                            </button>
                            {/* UC14 · Enviar à pessoa o link para criar uma senha nova (RF22) */}
                            {/* escondido em conta desativada: o servidor recusa, porque o link devolveria o acesso tirado */}
                            {atendente.ativo && (
                                <button
                                    type="button"
                                    className="botao-link"
                                    title="Enviar à pessoa um link para ela criar uma senha nova"
                                    onClick={() => aoEnviarLinkSenha(atendente)}
                                >
                                    Enviar link
                                </button>
                            )}
                            <button type="button" className="botao-link" onClick={() => aoAlternarSituacao(atendente)}>
                                {atendente.ativo ? "Desativar" : "Reativar"}
                            </button>
                            <button
                                type="button"
                                className="botao-icone-perigo"
                                title="Excluir conta"
                                aria-label={`Excluir a conta de ${atendente.pessoa.nome}`}
                                onClick={() => aoExcluir(atendente)}
                            >
                                <IconeLixeira className="h-[16px] w-[16px]" />
                            </button>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
