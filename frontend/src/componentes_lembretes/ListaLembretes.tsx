import { Link } from "react-router-dom";
import { type EntregaResumoApi, type LembreteApi } from "../servicos_api/ApiLembrete";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";
import { EtiquetasCliente } from "../componentes_tags/EtiquetasCliente";
import {
  calcularDiasAguardando,
  formatarDataSemHora,
  formatarDiasAguardando,
} from "../utilitarios_formatacao/FormatarData";
import { formatarTelefone } from "../utilitarios_formatacao/FormatarTelefone";

// acima disso o card fica comprido; o resto aparece como "+N" e está completo em "Ver cliente"
const MAXIMO_OUTRAS_ENTREGAS = 3;

// "Hilux (24/10/2026), Lente (10/05/2025) +2" — contexto das outras compras na hora da ligação
function descreverOutrasEntregas(outrasEntregas: EntregaResumoApi[]) {
  const entregasVisiveis = outrasEntregas
      .slice(0, MAXIMO_OUTRAS_ENTREGAS)
      .map((entrega) => `${entrega.produto} (${formatarDataSemHora(entrega.dataEntrega)})`)
      .join(", ");
  const entregasOcultas = outrasEntregas.length - MAXIMO_OUTRAS_ENTREGAS;
  if (entregasOcultas <= 0) return entregasVisiveis;
  return `${entregasVisiveis} +${entregasOcultas}`;
}

type PropriedadesListaLembretes = {
  lembretesPendentes: LembreteApi[];
  estaCarregando: boolean;
  lembreteEmAcao: number | null;
  aoAssumir: (lembreteSelecionado: LembreteApi) => void;
  aoLiberar: (lembreteSelecionado: LembreteApi) => void;
  aoConcluir: (lembreteSelecionado: LembreteApi) => void;
  // com busca ou filtro de tag ativo, a lista vazia não quer dizer que o marco está em dia
  filtroAtivo?: boolean;
  // cartão aberto a partir do "próximo cliente" do painel
  lembreteDestacadoId?: number | null;
};

const DIAS_PARA_ATENCAO = 3;
const DIAS_PARA_ALERTA = 7;

// a lista já vem de quem espera há mais tempo; a cor destaca quem passou do prazo de contato
function escolherClasseUrgencia(diasAguardando: number) {
  if (diasAguardando > DIAS_PARA_ALERTA) return "etiqueta etiqueta-alerta";
  if (diasAguardando > DIAS_PARA_ATENCAO) return "etiqueta etiqueta-atencao";
  return "etiqueta";
}

// UC05 · Ver lista de lembretes por marco (RF05, RF17)
export function ListaLembretes({
                                 lembretesPendentes,
                                 estaCarregando,
                                 lembreteEmAcao,
                                 aoAssumir,
                                 aoLiberar,
                                 aoConcluir,
                                 filtroAtivo = false,
                                 lembreteDestacadoId = null,
                               }: PropriedadesListaLembretes) {
  const { usuarioId, papelAcesso } = usarAutenticacao();

  if (estaCarregando && lembretesPendentes.length === 0) {
    return <div className="cartao mensagem-vazia">carregando lembretes...</div>;
  }

  if (lembretesPendentes.length === 0 && filtroAtivo) {
    return <div className="cartao mensagem-vazia">nenhum cliente encontrado com esses filtros neste marco.</div>;
  }

  if (lembretesPendentes.length === 0) {
    return <div className="cartao mensagem-vazia">nenhum cliente aguardando contato neste marco.</div>;
  }

  return (
      <ul className="flex flex-col gap-4">
        {lembretesPendentes.map((lembretePendente) => {
          const clienteLembrete = lembretePendente.marco.entrega.cliente;
          const atendenteResponsavel = lembretePendente.emAtendimentos?.usuario.pessoa.nome;
          const acaoEmAndamento = lembreteEmAcao === lembretePendente.id;
          // mesma regra do backend: só quem assumiu ou um admin libera o atendimento
          const assumidoPeloUsuario = lembretePendente.emAtendimentos?.usuario.id === usuarioId;
          const podeLiberar = papelAcesso === "admin" || assumidoPeloUsuario;
          const diasAguardando = calcularDiasAguardando(lembretePendente.marco.dataAlvo);
          const outrasEntregas = clienteLembrete.entregas.filter(
              (entrega) => entrega.id !== lembretePendente.marco.entrega.id,
          );

          return (
              <li
                  key={lembretePendente.id}
                  id={`lembrete-${lembretePendente.id}`}
                  className={`cartao grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] lg:items-center ${
                      lembretePendente.id === lembreteDestacadoId ? "ring-2 ring-black ring-offset-2" : ""
                  }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-[18px] font-bold text-black">{clienteLembrete.pessoa.nome}</h3>
                    {atendenteResponsavel ? (
                        <span className="etiqueta etiqueta-escura">Em atendimento com {atendenteResponsavel}</span>
                    ) : (
                        <span className="etiqueta">Aguardando contato</span>
                    )}
                    <span className={escolherClasseUrgencia(diasAguardando)}>{formatarDiasAguardando(diasAguardando)}</span>
                  </div>
                  <p className="mt-1 text-[14px] text-black/60">{formatarTelefone(clienteLembrete.contato)}</p>
                  <p className="mt-1 text-[14px] text-black">{lembretePendente.marco.entrega.produto}</p>
                  {outrasEntregas.length > 0 && (
                      <p className="mt-1 text-[13px] text-black/60">
                        Outras entregas: {descreverOutrasEntregas(outrasEntregas)}
                      </p>
                  )}
                  {lembretePendente.interacoes.length > 0 && (
                      <p className="mt-2">
                        <span className="etiqueta">
                          {lembretePendente.interacoes.length}{" "}
                          {lembretePendente.interacoes.length === 1 ? "tentativa registrada" : "tentativas registradas"}
                        </span>
                      </p>
                  )}
                  <EtiquetasCliente tagsCliente={clienteLembrete.tags} />
                </div>

                <dl className="flex gap-8 text-[13px]">
                  <div>
                    <dt className="font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-black/50">Entregue em</dt>
                    <dd className="mt-1 font-semibold">{formatarDataSemHora(lembretePendente.marco.entrega.dataEntrega)}</dd>
                  </div>
                  <div>
                    <dt className="font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-black/50">Marco em</dt>
                    <dd className="mt-1 font-semibold">{formatarDataSemHora(lembretePendente.marco.dataAlvo)}</dd>
                  </div>
                </dl>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {atendenteResponsavel && podeLiberar && (
                      <button
                          type="button"
                          className="botao-link"
                          onClick={() => aoLiberar(lembretePendente)}
                          disabled={acaoEmAndamento}
                      >
                        Liberar
                      </button>
                  )}
                  {!atendenteResponsavel && (
                      <button
                          type="button"
                          className="botao-link"
                          onClick={() => aoAssumir(lembretePendente)}
                          disabled={acaoEmAndamento}
                      >
                        Assumir
                      </button>
                  )}
                  <Link to={`/historico/${clienteLembrete.id}`} className="botao-link">
                    Ver cliente
                  </Link>
                  {/* RF17: abre o formulário, onde a atendente registra a tentativa e escolhe se já conclui */}
                  <button
                      type="button"
                      className="botao-link border-black bg-black text-white hover:bg-site-botao"
                      onClick={() => aoConcluir(lembretePendente)}
                      disabled={acaoEmAndamento}
                  >
                    Registrar contato
                  </button>
                </div>
              </li>
          );
        })}
      </ul>
  );
}
