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
      <div className="cartao tabela-wrapper">
        <table className="tabela">
          <thead>
          <tr>
            <th>Cliente</th>
            <th>Contato</th>
            <th>Entregue em</th>
            <th>Marco atingido em</th>
            <th>Situação</th>
            <th>Ações</th>
          </tr>
          </thead>
          <tbody>
          {lembretesPendentes.map((lembretePendente) => {
            const clienteLembrete = lembretePendente.marco.entrega.cliente;
            const atendenteResponsavel = lembretePendente.emAtendimentos?.usuario.pessoa.nome;
            const acaoEmAndamento = lembreteEmAcao === lembretePendente.id;

            return (
                <tr key={lembretePendente.id}>
                  <td className="font-medium text-viser-950">{clienteLembrete.pessoa.nome}</td>
                  <td>{clienteLembrete.contato}</td>
                  <td>{formatarDataEntrega(lembretePendente.marco.entrega.dataEntrega)}</td>
                  <td>{formatarData(lembretePendente.marco.dataAlvo)}</td>
                  <td>
                    {atendenteResponsavel ? (
                        <span className="text-viser-800">Em atendimento por {atendenteResponsavel}</span>
                    ) : (
                        <span className="text-viser-900/60">Aguardando contato</span>
                    )}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
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
                      <Link
                          to={`/historico/${clienteLembrete.id}?lembreteId=${lembretePendente.id}`}
                          className="botao-link"
                      >
                        Registrar contato
                      </Link>
                      <button
                          type="button"
                          className="botao-secundario py-1.5"
                          onClick={() => aoConcluir(lembretePendente)}
                          disabled={acaoEmAndamento}
                      >
                        Concluir
                      </button>
                    </div>
                  </td>
                </tr>
            );
          })}
          </tbody>
        </table>
      </div>
  );
}