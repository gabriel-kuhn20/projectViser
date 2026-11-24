import { useState } from "react";
import { type InteracaoApi } from "../servicos_api/ApiInteracao";
import { reabrirLembrete, type TentativaContatoApi } from "../servicos_api/ApiLembrete";
import { type ClienteApi } from "../servicos_api/ApiCliente";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";
import { EdicaoInteracao, MarcaEditado } from "./EdicaoInteracao";
import { FormularioInteracao, type LembreteContato } from "./FormularioInteracao";

type PropriedadesHistoricoInteracoes = {
  clienteHistorico: ClienteApi | null;
  interacoesCliente: InteracaoApi[];
  estaCarregando: boolean;
  aoAlterar: (mensagemSucesso: string) => void;
};

function formatarDataHora(dataCompleta: string) {
  return new Date(dataCompleta).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// a lista vem da mais recente para a mais antiga: o botão de reabrir aparece uma vez por lembrete,
// no contato mais recente dele, em vez de repetir em cada tentativa
function listarIdsUltimoContatoPorLembrete(interacoesCliente: InteracaoApi[]) {
  const lembretesVistos = new Set<number>();
  const idsUltimoContato = new Set<number>();
  for (const interacaoCliente of interacoesCliente) {
    if (lembretesVistos.has(interacaoCliente.lembrete.id)) continue;
    lembretesVistos.add(interacaoCliente.lembrete.id);
    idsUltimoContato.add(interacaoCliente.id);
  }
  return idsUltimoContato;
}

// o formulário de contato espera as tentativas do lembrete da mais antiga para a mais recente,
// e o histórico vem ao contrário e com as do cliente todo
function montarLembreteContato(
    clienteHistorico: ClienteApi,
    interacaoCliente: InteracaoApi,
    interacoesCliente: InteracaoApi[],
): LembreteContato {
  const tentativasLembrete: TentativaContatoApi[] = interacoesCliente
      .filter((interacao) => interacao.lembrete.id === interacaoCliente.lembrete.id)
      .reverse()
      .map((interacao) => ({
        id: interacao.id,
        conteudo: interacao.conteudo,
        respostaCliente: interacao.respostaCliente,
        criadoEm: interacao.criadoEm,
        editadoEm: interacao.editadoEm,
        usuarioId: interacao.usuario.id,
        usuario: { pessoa: interacao.usuario.pessoa },
      }));

  return {
    id: interacaoCliente.lembrete.id,
    marco: {
      entrega: {
        produto: interacaoCliente.lembrete.marco.entrega.produto,
        cliente: { contato: clienteHistorico.contato, pessoa: clienteHistorico.pessoa },
      },
    },
    interacoes: tentativasLembrete,
  };
}

// UC06 · Consultar histórico do cliente (RF06): também é onde se corrige um registro (RF05)
// e onde o admin reabre um lembrete concluído por engano (UC07 A3)
// UC07 · Concluir lembrete de contato (RF07, RF17): lembrete pendente (inclusive reaberto) recebe tentativa nova
// ou é concluído daqui, sem a atendente precisar voltar para Lembretes e procurar o cliente
export function HistoricoInteracoes({
                                      clienteHistorico,
                                      interacoesCliente,
                                      estaCarregando,
                                      aoAlterar,
                                    }: PropriedadesHistoricoInteracoes) {
  const { papelAcesso, usuarioId } = usarAutenticacao();
  const [interacaoEmEdicaoId, definirInteracaoEmEdicaoId] = useState<number | null>(null);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [lembreteReabrindoId, definirLembreteReabrindoId] = useState<number | null>(null);
  const [lembreteEmContato, definirLembreteEmContato] = useState<LembreteContato | null>(null);

  if (estaCarregando && interacoesCliente.length === 0) {
    return <div className="cartao mensagem-vazia">carregando histórico...</div>;
  }

  if (interacoesCliente.length === 0) {
    return <div className="cartao mensagem-vazia">nenhum contato registrado com este cliente ainda.</div>;
  }

  const ehAdmin = papelAcesso === "admin";
  const idsUltimoContato = listarIdsUltimoContatoPorLembrete(interacoesCliente);

  // mesma regra da API: autor ou admin, e só enquanto o lembrete está pendente
  function verificarPodeEditar(interacaoCliente: InteracaoApi) {
    const lembretePendente = interacaoCliente.lembrete.status === "pendente";
    return lembretePendente && (ehAdmin || interacaoCliente.usuario.id === usuarioId);
  }

  function verificarPodeReabrir(interacaoCliente: InteracaoApi) {
    return ehAdmin && interacaoCliente.lembrete.status === "concluido" && idsUltimoContato.has(interacaoCliente.id);
  }

  // um botão por lembrete pendente, no contato mais recente, como o de reabrir
  function verificarEhUltimoContatoPendente(interacaoCliente: InteracaoApi) {
    return interacaoCliente.lembrete.status === "pendente" && idsUltimoContato.has(interacaoCliente.id);
  }

  function buscarAtendimentoDeOutro(interacaoCliente: InteracaoApi) {
    const atendimentoAtual = interacaoCliente.lembrete.emAtendimentos;
    if (!atendimentoAtual || atendimentoAtual.usuario.id === usuarioId) return null;
    return atendimentoAtual;
  }

  // mesma regra da API (verificarAtendimentoDeOutro): lembrete assumido só recebe contato de quem assumiu ou de um admin
  function verificarPodeRegistrarContato(interacaoCliente: InteracaoApi) {
    if (!clienteHistorico || !verificarEhUltimoContatoPendente(interacaoCliente)) return false;
    return ehAdmin || buscarAtendimentoDeOutro(interacaoCliente) === null;
  }

  function aoAbrirContato(interacaoCliente: InteracaoApi) {
    if (!clienteHistorico) return;
    definirMensagemErro(null);
    definirInteracaoEmEdicaoId(null);
    definirLembreteEmContato(montarLembreteContato(clienteHistorico, interacaoCliente, interacoesCliente));
  }

  function aoRegistrarTentativa(lembreteAtualizado: LembreteContato) {
    definirLembreteEmContato(null);
    aoAlterar(`contato com ${lembreteAtualizado.marco.entrega.cliente.pessoa.nome} registrado; o lembrete continua pendente.`);
  }

  function aoConcluirContato(lembreteConcluido: LembreteContato) {
    definirLembreteEmContato(null);
    aoAlterar(`contato com ${lembreteConcluido.marco.entrega.cliente.pessoa.nome} concluído.`);
  }

  function aoSalvarEdicao() {
    definirInteracaoEmEdicaoId(null);
    aoAlterar("registro do contato atualizado.");
  }

  async function aoReabrirLembrete(interacaoCliente: InteracaoApi) {
    const nomeMarco = interacaoCliente.lembrete.marco.tipoMarco.nome;
    const confirmou = window.confirm(
        `Reabrir o lembrete de ${nomeMarco}? Ele volta para a lista de pendentes, com as tentativas já registradas.`,
    );
    if (!confirmou) return;

    definirMensagemErro(null);
    definirLembreteReabrindoId(interacaoCliente.lembrete.id);
    try {
      await reabrirLembrete(interacaoCliente.lembrete.id);
      aoAlterar(`lembrete de ${nomeMarco} reaberto; ele voltou para a lista de pendentes.`);
    } catch (erroRequisicao) {
      definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível reabrir o lembrete."));
    } finally {
      definirLembreteReabrindoId(null);
    }
  }

  return (
      <div>
        <h2 className="secao-titulo mb-4">Contatos registrados</h2>
        {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}
        {lembreteEmContato && (
            <FormularioInteracao
                key={lembreteEmContato.id}
                lembreteSelecionado={lembreteEmContato}
                aoRegistrar={aoRegistrarTentativa}
                aoConcluir={aoConcluirContato}
                aoCancelar={() => definirLembreteEmContato(null)}
                exibirTentativas={false}
            />
        )}
        <ol className="relative flex flex-col gap-4 border-l-2 border-black pl-6">
          {interacoesCliente.map((interacaoCliente) => {
            const estaEditando = interacaoCliente.id === interacaoEmEdicaoId;
            const podeEditar = verificarPodeEditar(interacaoCliente);
            const podeReabrir = verificarPodeReabrir(interacaoCliente);
            const podeRegistrarContato = verificarPodeRegistrarContato(interacaoCliente) && lembreteEmContato === null;
            // a atendente vê o aviso no lugar do botão, para entender por que não consegue registrar;
            // o admin vê junto do botão, para não concluir sem saber que alguém está ligando para o cliente
            const atendimentoDeOutro = verificarEhUltimoContatoPendente(interacaoCliente)
                ? buscarAtendimentoDeOutro(interacaoCliente)
                : null;

            return (
                <li key={interacaoCliente.id} className="cartao relative">
                  {/* ponto na linha do tempo, como em "4 anos de Viser" */}
                  <span className="absolute -left-[31px] top-7 h-3 w-3 rounded-full bg-black" aria-hidden="true" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-black">{interacaoCliente.usuario.pessoa.nome}</span>
                    <span className="flex flex-wrap items-center gap-2 text-[13px] text-black/55">
                      {/* produto junto do marco: cliente com mais de uma compra precisa saber de qual foi a conversa.
                          O produto é texto livre e pode ser longo: a etiqueta quebra linha em vez de alargar a página no celular (RNF05) */}
                      <span className="etiqueta whitespace-normal text-left [overflow-wrap:anywhere]">
                        {interacaoCliente.lembrete.marco.entrega.produto} · {interacaoCliente.lembrete.marco.tipoMarco.nome}
                      </span>
                      <time dateTime={interacaoCliente.criadoEm}>{formatarDataHora(interacaoCliente.criadoEm)}</time>
                      <MarcaEditado editadoEm={interacaoCliente.editadoEm} />
                    </span>
                  </div>

                  {estaEditando && (
                      <EdicaoInteracao
                          interacaoEmEdicao={interacaoCliente}
                          aoSalvar={aoSalvarEdicao}
                          aoCancelar={() => definirInteracaoEmEdicaoId(null)}
                      />
                  )}

                  {!estaEditando && (
                      <>
                        {/* overflow-wrap: um link colado não tem espaço para quebrar e alargaria a página no celular (RNF05) */}
                        <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-black/85 [overflow-wrap:anywhere]">
                          {interacaoCliente.conteudo}
                        </p>
                        {interacaoCliente.respostaCliente && (
                            <p className="mt-3 whitespace-pre-line rounded-[10px] bg-app-fundo px-4 py-3 text-[14px] text-black/80 [overflow-wrap:anywhere]">
                              <span className="font-semibold">Resposta da cliente:</span> {interacaoCliente.respostaCliente}
                            </p>
                        )}
                      </>
                  )}

                  {!estaEditando && (podeEditar || podeReabrir || podeRegistrarContato || atendimentoDeOutro) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {podeEditar && (
                            <button
                                type="button"
                                className="botao-link"
                                onClick={() => definirInteracaoEmEdicaoId(interacaoCliente.id)}
                            >
                              Editar
                            </button>
                        )}
                        {podeRegistrarContato && (
                            <button type="button" className="botao-link" onClick={() => aoAbrirContato(interacaoCliente)}>
                              Registrar ou concluir contato
                            </button>
                        )}
                        {atendimentoDeOutro && (
                            <span className="self-center text-[13px] text-black/55">
                              em atendimento com {atendimentoDeOutro.usuario.pessoa.nome}
                            </span>
                        )}
                        {podeReabrir && (
                            <button
                                type="button"
                                className="botao-link"
                                onClick={() => aoReabrirLembrete(interacaoCliente)}
                                disabled={lembreteReabrindoId !== null}
                            >
                              {lembreteReabrindoId === interacaoCliente.lembrete.id ? "Reabrindo..." : "Reabrir lembrete"}
                            </button>
                        )}
                      </div>
                  )}
                </li>
            );
          })}
        </ol>
      </div>
  );
}
