import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { HistoricoInteracoes } from "../componentes_interacoes/HistoricoInteracoes";
import { ListaEntregas } from "../componentes_entregas/ListaEntregas";
import { FormularioEntrega } from "../componentes_entregas/FormularioEntrega";
import { SelecaoTagsCliente } from "../componentes_tags/SelecaoTagsCliente";
import { FormularioCliente } from "../componentes_pessoas/FormularioCliente";
import { buscarClientePorId, type ClienteApi } from "../servicos_api/ApiCliente";
import { listarHistoricoCliente, type InteracaoApi } from "../servicos_api/ApiInteracao";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";
import { IconeVoltar } from "../componentes_layout/IconesMenu";
import { TituloPagina } from "../componentes_layout/TituloPagina";
import { formatarTelefone } from "../utilitarios_formatacao/FormatarTelefone";

// UC06 · Consultar histórico do cliente (RF06, RF18): dados, entregas, tags e histórico na mesma tela;
// a edição do cliente (UC02) também fica aqui, fora da lista
export function PaginaHistorico() {
    const { clienteId: clienteIdRota } = useParams();
    const clienteId = Number(clienteIdRota);
    const { papelAcesso } = usarAutenticacao();
    // vindo do cadastro (PaginaNovoCliente), a mensagem de sucesso chega pela navegação
    const estadoNavegacao = useLocation().state as { mensagemSucesso?: string } | null;

    const [clienteSelecionado, definirClienteSelecionado] = useState<ClienteApi | null>(null);
    const [interacoesCliente, definirInteracoesCliente] = useState<InteracaoApi[]>([]);
    const [estaCarregando, definirEstaCarregando] = useState(true);
    const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
    const [mensagemSucesso, definirMensagemSucesso] = useState<string | null>(estadoNavegacao?.mensagemSucesso ?? null);
    const [estaEditando, definirEstaEditando] = useState(false);

    const carregarHistorico = useCallback(async () => {
        // id da URL que não é número (/historico/abc) nem chega na API — senão a tela mostra o erro técnico do Zod
        const clienteIdValido = Number.isInteger(clienteId) && clienteId > 0;
        if (!clienteIdValido) {
            definirClienteSelecionado(null);
            definirInteracoesCliente([]);
            definirMensagemErro("cliente inválido.");
            definirEstaCarregando(false);
            return;
        }

        definirEstaCarregando(true);
        try {
            const [clienteEncontrado, interacoesEncontradas] = await Promise.all([
                buscarClientePorId(clienteId),
                listarHistoricoCliente(clienteId),
            ]);
            definirClienteSelecionado(clienteEncontrado);
            definirInteracoesCliente(interacoesEncontradas);
            definirMensagemErro(null);
        } catch (erroRequisicao) {
            // a página continua montada quando só o :clienteId muda — sem limpar, o erro aparecia
            // embaixo do nome e do histórico do cliente aberto antes
            definirClienteSelecionado(null);
            definirInteracoesCliente([]);
            definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível carregar o cliente."));
        } finally {
            definirEstaCarregando(false);
        }
    }, [clienteId]);

    useEffect(() => {
        carregarHistorico();
    }, [carregarHistorico]);

    // a resposta das tags e da edição não traz as entregas: mantém as que já estão na tela
    function aoSalvarTags(clienteAtualizado: ClienteApi) {
        definirClienteSelecionado((clienteAtual) => ({ ...clienteAtualizado, entregas: clienteAtual?.entregas }));
    }

    function aoSalvarEdicao(clienteAtualizado: ClienteApi) {
        aoSalvarTags(clienteAtualizado);
        definirEstaEditando(false);
        definirMensagemSucesso("alterações do cliente salvas.");
    }

    // edição ou reabertura: recarrega para o status do lembrete e o "(editado)" virem do servidor
    async function aoAlterarHistorico(mensagemAlteracao: string) {
        definirMensagemSucesso(mensagemAlteracao);
        await carregarHistorico();
    }

    return (
        <div>
            <Link to="/clientes" className="link-voltar">
                <IconeVoltar className="h-4 w-4" />
                Voltar para clientes
            </Link>

            <TituloPagina
                titulo={clienteSelecionado ? clienteSelecionado.pessoa.nome : "Cliente"}
                subtitulo={clienteSelecionado ? `Contato: ${formatarTelefone(clienteSelecionado.contato)}` : undefined}
            />

            {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}
            {mensagemSucesso && <p role="status" className="mensagem-sucesso">{mensagemSucesso}</p>}

            {clienteSelecionado && estaEditando && (
                <div className="mb-8">
                    <FormularioCliente
                        clienteEmEdicao={clienteSelecionado}
                        aoSalvar={aoSalvarEdicao}
                        aoCancelarEdicao={() => definirEstaEditando(false)}
                    />
                </div>
            )}

            {clienteSelecionado && (
                <div className="mb-8 grid gap-5 lg:grid-cols-2">
                    {/* min-w-0: item de grid cresce até caber o conteúdo; sem ele a tabela de entregas
                        alarga a tela no celular em vez de rolar dentro do cartão (RNF05) */}
                    <section className="cartao min-w-0">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="secao-titulo">Dados</h3>
                            {!estaEditando && (
                                <button
                                    type="button"
                                    className="botao-link"
                                    onClick={() => {
                                        definirMensagemSucesso(null);
                                        definirEstaEditando(true);
                                    }}
                                >
                                    Editar dados
                                </button>
                            )}
                        </div>
                        <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-[14px]">
                            <dt className="text-black/55">Contato</dt>
                            <dd>{formatarTelefone(clienteSelecionado.contato)}</dd>
                            <dt className="text-black/55">Endereço</dt>
                            <dd>{clienteSelecionado.endereco || "—"}</dd>
                            <dt className="text-black/55">Responsável</dt>
                            <dd>{clienteSelecionado.responsavel?.pessoa.nome ?? "—"}</dd>
                        </dl>

                        <h3 className="secao-titulo mt-7 mb-4">Tags</h3>
                        <SelecaoTagsCliente
                            clienteSelecionado={clienteSelecionado}
                            podeAlterar={papelAcesso === "admin"}
                            aoSalvar={aoSalvarTags}
                        />
                    </section>

                    <section className="cartao min-w-0">
                        <h3 className="secao-titulo mb-4">Entregas</h3>
                        <ListaEntregas entregasCliente={clienteSelecionado.entregas ?? []} />
                        <FormularioEntrega clienteId={clienteSelecionado.id} aoCadastrar={carregarHistorico} />
                    </section>
                </div>
            )}

            <h3 className="secao-titulo mb-4">Histórico de contatos</h3>
            <HistoricoInteracoes
                interacoesCliente={interacoesCliente}
                estaCarregando={estaCarregando}
                aoAlterar={aoAlterarHistorico}
            />
        </div>
    );
}
