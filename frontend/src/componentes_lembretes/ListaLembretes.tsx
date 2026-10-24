import { Link } from "react-router-dom";
import { type LembreteApi } from "../servicos_api/ApiLembrete";

type PropriedadesListaLembretes = {
  lembretesPendentes: LembreteApi[];
  estaCarregando: boolean;
  lembreteEmAcao: number | null;
  aoAssumir: (lembreteSelecionado: LembreteApi) => void;
  aoLiberar: (lembreteSelecionado: LembreteApi) => void;
  aoConcluir: (lembreteSelecionado: LembreteApi) => void;
};

// dataEntrega é só data (vem como meia-noite em UTC); formatar no fuso local
// mostraria o dia anterior no Brasil, por isso o timeZone fixo
function formatarDataEntrega(dataEntrega: string) {
  return new Date(dataEntrega).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function formatarData(dataCompleta: string) {
  return new Date(dataCompleta).toLocaleDateString("pt-BR");
}

// UC05 · Ver lista de lembretes por marco (RF04)
export function ListaLembretes({
                                 lembretesPendentes,
                                 estaCarregando,
                                 lembreteEmAcao,
                                 aoAssumir,
                                 aoLiberar,
                                 aoConcluir,
                               }: PropriedadesListaLembretes) {
  if (estaCarregando && lembretesPendentes.length === 0) {
    return <div className="cartao mensagem-vazia">carregando lembretes...</div>;
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

          return (
              <li
                  key={lembretePendente.id}
                  className="cartao grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] lg:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-[18px] font-bold text-black">{clienteLembrete.pessoa.nome}</h3>
                    {atendenteResponsavel ? (
                        <span className="etiqueta etiqueta-escura">Em atendimento com {atendenteResponsavel}</span>
                    ) : (
                        <span className="etiqueta">Aguardando contato</span>
                    )}
                  </div>
                  <p className="mt-1 text-[14px] text-black/60">{clienteLembrete.contato}</p>
                </div>

                <dl className="flex gap-8 text-[13px]">
                  <div>
                    <dt className="font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-black/50">Entregue em</dt>
                    <dd className="mt-1 font-semibold">{formatarDataEntrega(lembretePendente.marco.entrega.dataEntrega)}</dd>
                  </div>
                  <div>
                    <dt className="font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-black/50">Marco em</dt>
                    <dd className="mt-1 font-semibold">{formatarData(lembretePendente.marco.dataAlvo)}</dd>
                  </div>
                </dl>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {atendenteResponsavel ? (
                      <button
                          type="button"
                          className="botao-link"
                          onClick={() => aoLiberar(lembretePendente)}
                          disabled={acaoEmAndamento}
                      >
                        Liberar
                      </button>
                  ) : (
                      <button
                          type="button"
                          className="botao-link"
                          onClick={() => aoAssumir(lembretePendente)}
                          disabled={acaoEmAndamento}
                      >
                        Assumir
                      </button>
                  )}
                  <Link to={`/historico/${clienteLembrete.id}?lembreteId=${lembretePendente.id}`} className="botao-link">
                    Registrar contato
                  </Link>
                  <button
                      type="button"
                      className="botao-link border-black bg-black text-white hover:bg-site-botao"
                      onClick={() => aoConcluir(lembretePendente)}
                      disabled={acaoEmAndamento}
                  >
                    Concluir
                  </button>
                </div>
              </li>
          );
        })}
      </ul>
  );
}
