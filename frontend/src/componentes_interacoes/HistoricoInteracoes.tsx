import { useState } from "react";
import { type InteracaoApi } from "../servicos_api/ApiInteracao";
import { reabrirLembrete } from "../servicos_api/ApiLembrete";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";
import { EdicaoInteracao, MarcaEditado } from "./EdicaoInteracao";

type PropriedadesHistoricoInteracoes = {
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

// UC06 · Consultar histórico do cliente (RF06): também é onde se corrige um registro (RF05)
// e onde o admin reabre um lembrete concluído por engano (UC07 A3)
export function HistoricoInteracoes({ interacoesCliente, estaCarregando, aoAlterar }: PropriedadesHistoricoInteracoes) {
  const { papelAcesso, usuarioId } = usarAutenticacao();
  const [interacaoEmEdicaoId, definirInteracaoEmEdicaoId] = useState<number | null>(null);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [lembreteReabrindoId, definirLembreteReabrindoId] = useState<number | null>(null);

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
        <ol className="relative flex flex-col gap-4 border-l-2 border-black pl-6">
          {interacoesCliente.map((interacaoCliente) => {
            const estaEditando = interacaoCliente.id === interacaoEmEdicaoId;
            const podeEditar = verificarPodeEditar(interacaoCliente);
            const podeReabrir = verificarPodeReabrir(interacaoCliente);

            return (
                <li key={interacaoCliente.id} className="cartao relative">
                  {/* ponto na linha do tempo, como em "3 anos de Viser" */}
                  <span className="absolute -left-[31px] top-7 h-3 w-3 rounded-full bg-black" aria-hidden="true" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-black">{interacaoCliente.usuario.pessoa.nome}</span>
                    <span className="flex flex-wrap items-center gap-2 text-[13px] text-black/55">
                      <span className="etiqueta">{interacaoCliente.lembrete.marco.tipoMarco.nome}</span>
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
                        <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-black/85">
                          {interacaoCliente.conteudo}
                        </p>
                        {interacaoCliente.respostaCliente && (
                            <p className="mt-3 whitespace-pre-line rounded-[10px] bg-app-fundo px-4 py-3 text-[14px] text-black/80">
                              <span className="font-semibold">Resposta da cliente:</span> {interacaoCliente.respostaCliente}
                            </p>
                        )}
                      </>
                  )}

                  {!estaEditando && (podeEditar || podeReabrir) && (
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
