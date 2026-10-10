import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ListaLembretes } from "../componentes_lembretes/ListaLembretes";
import { usarMarcosPendentes } from "../hooks_dados/useMarcosPendentes";
import {
  concluirLembrete,
  desmarcarEmAtendimento,
  marcarEmAtendimento,
  type LembreteApi,
} from "../servicos_api/ApiLembrete";
import { rotulosTipoMarco, tiposMarcoDisponiveis, type TipoMarco } from "../tipos_compartilhados/TiposDominio";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

// UC05 · Ver lista de lembretes por marco (tela do dia a dia da atendente)
// UC08 · Concluir lembrete de contato (RF07) / UC09 · Marcar lembrete como em atendimento (RF08)
export function PaginaLembretes() {
  // o marco vem da URL (?marco=2m) para o cartão do painel abrir direto na aba certa;
  // valor ausente ou inválido cai no primeiro marco
  const [parametrosBusca, definirParametrosBusca] = useSearchParams();
  const marcoUrl = parametrosBusca.get("marco") as TipoMarco | null;
  const marcoSelecionado: TipoMarco =
      marcoUrl && tiposMarcoDisponiveis.includes(marcoUrl) ? marcoUrl : tiposMarcoDisponiveis[0];
  const [lembreteEmAcao, definirLembreteEmAcao] = useState<number | null>(null);
  const [mensagemAcao, definirMensagemAcao] = useState<string | null>(null);
  const { lembretesPendentes, estaCarregando, mensagemErro, recarregarLembretes } =
      usarMarcosPendentes(marcoSelecionado);

  // trava os botões do lembrete enquanto a API responde e recarrega a lista no fim,
  // mesmo em caso de erro — outro atendente pode ter mexido no mesmo lembrete
  async function executarAcaoLembrete(
      lembreteSelecionado: LembreteApi,
      acaoLembrete: (lembreteId: number) => Promise<void>,
      mensagemFalha: string
  ) {
    definirMensagemAcao(null);
    definirLembreteEmAcao(lembreteSelecionado.id);
    try {
      await acaoLembrete(lembreteSelecionado.id);
    } catch (erroRequisicao) {
      definirMensagemAcao(formatarMensagemErro(erroRequisicao, mensagemFalha));
    } finally {
      definirLembreteEmAcao(null);
      await recarregarLembretes();
    }
  }

  function aoAssumirLembrete(lembreteSelecionado: LembreteApi) {
    executarAcaoLembrete(lembreteSelecionado, marcarEmAtendimento, "não foi possível assumir o atendimento.");
  }

  function aoLiberarLembrete(lembreteSelecionado: LembreteApi) {
    executarAcaoLembrete(lembreteSelecionado, desmarcarEmAtendimento, "não foi possível liberar o atendimento.");
  }

  function aoConcluirLembrete(lembreteSelecionado: LembreteApi) {
    const nomeCliente = lembreteSelecionado.marco.entrega.cliente.pessoa.nome;
    const conclusaoConfirmada = window.confirm(`Concluir o contato com ${nomeCliente}?`);
    if (!conclusaoConfirmada) return;
    executarAcaoLembrete(lembreteSelecionado, concluirLembrete, "não foi possível concluir o lembrete.");
  }

  function aoSelecionarMarco(tipoMarcoEscolhido: TipoMarco) {
    definirMensagemAcao(null);
    definirParametrosBusca({ marco: tipoMarcoEscolhido });
  }

  return (
      <div>
        <h2 className="pagina-titulo">Lembretes</h2>

        <div
            role="tablist"
            aria-label="Marco de acompanhamento"
            className="inline-flex rounded-md border border-viser-creme2 bg-white p-1 mb-3"
        >
          {tiposMarcoDisponiveis.map((tipoMarcoAba) => {
            const marcoAtivo = tipoMarcoAba === marcoSelecionado;
            return (
                <button
                    key={tipoMarcoAba}
                    type="button"
                    role="tab"
                    aria-selected={marcoAtivo}
                    onClick={() => aoSelecionarMarco(tipoMarcoAba)}
                    className={`rounded px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-viser-700 ${
                        marcoAtivo ? "bg-viser-950 text-viser-creme" : "text-viser-900 hover:bg-viser-creme2"
                    }`}
                >
                  {rotulosTipoMarco[tipoMarcoAba]}
                </button>
            );
          })}
        </div>

        <p className="text-sm text-viser-900/70 mb-6">
          Clientes que completaram {rotulosTipoMarco[marcoSelecionado]} desde a entrega e ainda não receberam o contato
          de acompanhamento.
          {!estaCarregando && ` ${lembretesPendentes.length} pendente(s).`}
        </p>

        {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}
        {mensagemAcao && <p role="alert" className="mensagem-erro">{mensagemAcao}</p>}

        <ListaLembretes
            lembretesPendentes={lembretesPendentes}
            estaCarregando={estaCarregando}
            lembreteEmAcao={lembreteEmAcao}
            aoAssumir={aoAssumirLembrete}
            aoLiberar={aoLiberarLembrete}
            aoConcluir={aoConcluirLembrete}
        />
      </div>
  );
}