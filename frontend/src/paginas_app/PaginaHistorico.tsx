import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { HistoricoInteracoes } from "../componentes_interacoes/HistoricoInteracoes";
import { ListaEntregas } from "../componentes_entregas/ListaEntregas";
import { FormularioEntrega } from "../componentes_entregas/FormularioEntrega";
import { encontrarProximoMarco, FormularioContatoAntecipado } from "../componentes_entregas/FormularioContatoAntecipado";
import { SelecaoTagsCliente } from "../componentes_tags/SelecaoTagsCliente";
import { FormularioCliente } from "../componentes_pessoas/FormularioCliente";
import { buscarClientePorId, type ClienteApi } from "../servicos_api/ApiCliente";
import { listarTiposMarco, type TipoMarcoApi } from "../servicos_api/ApiTipoMarco";
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
    const [estaRegistrandoEntrega, definirEstaRegistrandoEntrega] = useState(false);
    const semEntregas = (clienteSelecionado?.entregas ?? []).length === 0;
    const [tiposMarcoAtivos, definirTiposMarcoAtivos] = useState<TipoMarcoApi[]>([]);
    const [estaRegistrandoContato, definirEstaRegistrandoContato] = useState(false);

    // o botão só aparece se alguma entrega ainda tem marco por vir
    const possuiContatoAntecipavel = (clienteSelecionado?.entregas ?? []).some((entrega) =>
        encontrarProximoMarco(entrega, tiposMarcoAtivos)
    );

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

    useEffect(() => {
        async function carregarTiposMarco() {
            try {
                const tiposMarco = await listarTiposMarco();
                definirTiposMarcoAtivos(tiposMarco.filter((tipoMarco) => tipoMarco.ativo));
            } catch {
                // sem os marcos só some a coluna de próximo contato; o resto da tela segue funcionando
                definirTiposMarcoAtivos([]);
            }
        }
        carregarTiposMarco();
    }, []);

    // a resposta das tags e da edição não traz as entregas: mantém as que já estão na tela
    function aoSalvarTags(clienteAtualizado: ClienteApi) {
        definirClienteSelecionado((clienteAtual) => ({ ...clienteAtualizado, entregas: clienteAtual?.entregas }));
    }

    function aoSalvarEdicao(clienteAtualizado: ClienteApi) {
        aoSalvarTags(clienteAtualizado);
        definirEstaEditando(false);
        definirMensagemSucesso("alterações do cliente salvas.");
    }

    // o marco novo e a interação vêm do servidor: recarrega entregas e histórico
    async function aoSalvarContatoAntecipado(mensagemContato: string) {
        definirEstaRegistrandoContato(false);
        await aoAlterarHistorico(mensagemContato);
    }

    // edição ou reabertura: recarrega para o status do lembrete e o "(editado)" virem do servidor
    async function aoCadastrarEntrega(mensagemEntrega: string) {
        definirEstaRegistrandoEntrega(false);
        await aoAlterarHistorico(mensagemEntrega);
    }

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
                        </dl>

                        <h3 className="secao-titulo mt-7 mb-4">Tags</h3>
                        <SelecaoTagsCliente
                            clienteSelecionado={clienteSelecionado}
                            podeAlterar={papelAcesso === "admin"}
                            aoSalvar={aoSalvarTags}
                        />
                    </section>

                    <section className="cartao min-w-0">
                        {/* nova entrega no topo, recolhida: está sempre à mão sem ocupar a tela de quem só consulta */}
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="secao-titulo">Entregas</h3>
                            {!estaRegistrandoEntrega && !semEntregas && (
                                <button
                                    type="button"
                                    className="botao-link"
                                    onClick={() => {
                                        definirMensagemSucesso(null);
                                        definirEstaRegistrandoEntrega(true);
                                    }}
                                >
                                    Nova entrega
                                </button>
                            )}
                        </div>
                        {/* cliente sem entrega nenhuma: o formulário já vem aberto, é a única coisa a fazer */}
                        {(estaRegistrandoEntrega || semEntregas) && (
                            <FormularioEntrega
                                clienteId={clienteSelecionado.id}
                                aoCadastrar={aoCadastrarEntrega}
                                aoCancelar={semEntregas ? undefined : () => definirEstaRegistrandoEntrega(false)}
                            />
                        )}
                        <ListaEntregas entregasCliente={clienteSelecionado.entregas ?? []} aoAlterar={aoAlterarHistorico} />
                    </section>
                </div>
            )}

            {/* UC07: contato antes do marco vencer — fica junto do histórico, onde a atendente procura */}
            <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="secao-titulo">Histórico de contatos</h3>
                {possuiContatoAntecipavel && !estaRegistrandoContato && (
                    <button
                        type="button"
                        className="botao-link"
                        onClick={() => {
                            definirMensagemSucesso(null);
                            definirEstaRegistrandoContato(true);
                        }}
                    >
                        Registrar contato
                    </button>
                )}
            </div>
            {clienteSelecionado && estaRegistrandoContato && (
                <FormularioContatoAntecipado
                    // entrega nova ou excluída com o formulário aberto: recria para a escolha voltar ao padrão
                    key={(clienteSelecionado.entregas ?? []).map((entrega) => entrega.id).join("-")}
                    entregasCliente={clienteSelecionado.entregas ?? []}
                    tiposMarcoAtivos={tiposMarcoAtivos}
                    aoSalvar={aoSalvarContatoAntecipado}
                    aoCancelar={() => definirEstaRegistrandoContato(false)}
                />
            )}
            <HistoricoInteracoes
                clienteHistorico={clienteSelecionado}
                interacoesCliente={interacoesCliente}
                estaCarregando={estaCarregando}
                aoAlterar={aoAlterarHistorico}
            />
        </div>
    );
}
