import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ListaLembretes } from "../componentes_lembretes/ListaLembretes";
import { FormularioInteracao } from "../componentes_interacoes/FormularioInteracao";
import { usarMarcosPendentes } from "../hooks_dados/useMarcosPendentes";
import {
  desmarcarEmAtendimento,
  marcarEmAtendimento,
  type LembreteApi,
} from "../servicos_api/ApiLembrete";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";
import { obterPainel, type PendenciasMarcoApi } from "../servicos_api/ApiPainel";
import { FiltroTag, possuiTag } from "../componentes_tags/FiltroTag";
import { CampoBusca } from "../componentes_compartilhados/CampoBusca";
import { correspondeBusca } from "../utilitarios_formatacao/BuscarTexto";
import { TituloPagina } from "../componentes_layout/TituloPagina";

// UC05 · Ver lista de lembretes por marco (RF05, RF17) — tela do dia a dia da atendente
// UC07 · Concluir lembrete de contato (RF07) / UC08 · Marcar lembrete como em atendimento (RF08)
export function PaginaLembretes() {
  // a URL diz o marco (?marco=<id>) para o painel abrir direto na aba certa; ?concluir=<id> já abre o
  // formulário de um lembrete e ?lembrete=<id> destaca o cartão. Marco ausente ou inválido cai no primeiro
  const [parametrosBusca, definirParametrosBusca] = useSearchParams();
  const [marcosAbas, definirMarcosAbas] = useState<PendenciasMarcoApi[] | null>(null);
  const marcoUrlId = Number(parametrosBusca.get("marco"));
  const marcoUrlValido = marcosAbas?.some((marcoAba) => marcoAba.id === marcoUrlId) ?? false;
  const marcoSelecionadoId = marcoUrlValido ? marcoUrlId : (marcosAbas?.[0]?.id ?? null);
  const marcoSelecionado = marcosAbas?.find((marcoAba) => marcoAba.id === marcoSelecionadoId) ?? null;
  const lembreteParaConcluirId = Number(parametrosBusca.get("concluir")) || null;
  const lembreteDestacadoId = Number(parametrosBusca.get("lembrete")) || null;
  const [lembreteEmAcao, definirLembreteEmAcao] = useState<number | null>(null);
  const [mensagemAcao, definirMensagemAcao] = useState<string | null>(null);
  const [mensagemSucesso, definirMensagemSucesso] = useState<string | null>(null);
  const [lembreteEmConclusao, definirLembreteEmConclusao] = useState<LembreteApi | null>(null);
  const [tagIdFiltro, definirTagIdFiltro] = useState<number | null>(null);
  const [termoBusca, definirTermoBusca] = useState("");
  const { lembretesPendentes, estaCarregando, mensagemErro, recarregarLembretes } =
      usarMarcosPendentes(marcoSelecionadoId);

  const lembretesFiltrados = lembretesPendentes.filter((lembretePendente) => {
    const { cliente, produto } = lembretePendente.marco.entrega;
    return possuiTag(cliente.tags, tagIdFiltro) && correspondeBusca(termoBusca, [cliente.pessoa.nome, cliente.contato, produto]);
  });
  const filtroAtivo = tagIdFiltro !== null || termoBusca.trim() !== "";

  // as abas são os marcos ativos cadastrados pelo administrador, já com o contador de cada um
  // (mesma rota do painel): mostra onde há pendência sem abrir cada marco
  const carregarMarcosAbas = useCallback(async () => {
    try {
      definirMarcosAbas((await obterPainel()).marcos);
    } catch (erroRequisicao) {
      definirMensagemAcao(formatarMensagemErro(erroRequisicao, "não foi possível carregar os marcos."));
      definirMarcosAbas([]);
    }
  }, []);

  useEffect(() => {
    carregarMarcosAbas();
  }, [carregarMarcosAbas]);

  // vindo de "continuar atendimento" no painel: abre o formulário de conclusão daquele lembrete
  useEffect(() => {
    if (lembreteParaConcluirId === null || estaCarregando) return;
    const lembreteParaConcluir = lembretesPendentes.find((lembrete) => lembrete.id === lembreteParaConcluirId);
    if (lembreteParaConcluir) definirLembreteEmConclusao(lembreteParaConcluir);
    // tira o parâmetro para o formulário não reabrir depois de concluir ou cancelar
    definirParametrosBusca({ marco: String(marcoSelecionadoId) }, { replace: true });
  }, [lembreteParaConcluirId, estaCarregando, lembretesPendentes, marcoSelecionadoId, definirParametrosBusca]);

  // vindo de "próximo cliente" no painel: rola até o cartão destacado
  useEffect(() => {
    if (lembreteDestacadoId === null || estaCarregando) return;
    document.getElementById(`lembrete-${lembreteDestacadoId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [lembreteDestacadoId, estaCarregando]);

  // depois de qualquer ação a lista e os contadores mudam juntos
  async function recarregarTela() {
    await Promise.all([recarregarLembretes(), carregarMarcosAbas()]);
  }

  // trava os botões do lembrete enquanto a API responde e recarrega a lista no fim,
  // mesmo em caso de erro — outro atendente pode ter mexido no mesmo lembrete
  async function executarAcaoLembrete(
      lembreteSelecionado: LembreteApi,
      acaoLembrete: (lembreteId: number) => Promise<void>,
      mensagemFalha: string
  ) {
    definirMensagemAcao(null);
    definirMensagemSucesso(null);
    definirLembreteEmAcao(lembreteSelecionado.id);
    try {
      await acaoLembrete(lembreteSelecionado.id);
    } catch (erroRequisicao) {
      definirMensagemAcao(formatarMensagemErro(erroRequisicao, mensagemFalha));
    } finally {
      definirLembreteEmAcao(null);
      await recarregarTela();
    }
  }

  function aoAssumirLembrete(lembreteSelecionado: LembreteApi) {
    executarAcaoLembrete(lembreteSelecionado, marcarEmAtendimento, "não foi possível assumir o atendimento.");
  }

  function aoLiberarLembrete(lembreteSelecionado: LembreteApi) {
    executarAcaoLembrete(lembreteSelecionado, desmarcarEmAtendimento, "não foi possível liberar o atendimento.");
  }

  // o formulário preenchido já é a confirmação, por isso não há window.confirm aqui
  function aoAbrirConclusao(lembreteSelecionado: LembreteApi) {
    definirMensagemAcao(null);
    definirMensagemSucesso(null);
    definirLembreteEmConclusao(lembreteSelecionado);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function aoConcluirLembrete(lembreteConcluido: LembreteApi) {
    definirLembreteEmConclusao(null);
    definirMensagemSucesso(`contato com ${lembreteConcluido.marco.entrega.cliente.pessoa.nome} concluído.`);
    await recarregarTela();
  }

  // a tentativa foi gravada, mas o lembrete segue pendente até alguém concluir
  async function aoRegistrarTentativa(lembreteAtualizado: LembreteApi) {
    definirLembreteEmConclusao(null);
    definirMensagemSucesso(
        `contato com ${lembreteAtualizado.marco.entrega.cliente.pessoa.nome} registrado; o lembrete continua pendente.`,
    );
    await recarregarTela();
  }

  function aoSelecionarMarco(tipoMarcoEscolhidoId: number) {
    definirMensagemAcao(null);
    definirMensagemSucesso(null);
    definirLembreteEmConclusao(null);
    definirParametrosBusca({ marco: String(tipoMarcoEscolhidoId) });
  }

  const semMarcosAtivos = marcosAbas !== null && marcosAbas.length === 0;

  return (
      <div>
        <TituloPagina
            titulo="Lembretes"
            subtitulo="Clientes que completaram um marco desde a entrega e ainda não receberam o contato de acompanhamento."
        />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div role="tablist" aria-label="Marco de acompanhamento" className="abas">
            {(marcosAbas ?? []).map((marcoAba) => {
              const marcoAtivo = marcoAba.id === marcoSelecionadoId;
              return (
                  <button
                      key={marcoAba.id}
                      type="button"
                      role="tab"
                      aria-selected={marcoAtivo}
                      onClick={() => aoSelecionarMarco(marcoAba.id)}
                      className={`aba ${marcoAtivo ? "ativa" : ""}`}
                  >
                    {marcoAba.nome}
                    <span className="ml-1.5 tabular-nums">({marcoAba.pendentes})</span>
                  </button>
              );
            })}
          </div>
          {!estaCarregando && marcoSelecionado && (
              <p className="text-[14px] text-black/60">
                <strong className="text-[20px] font-bold text-black">{lembretesFiltrados.length}</strong>{" "}
                {lembretesFiltrados.length === 1 ? "cliente pendente" : "clientes pendentes"} em {marcoSelecionado.nome}
              </p>
          )}
        </div>

        <div className="mb-6 flex flex-wrap items-end gap-4">
          <CampoBusca
              rotulo="Buscar no marco"
              valor={termoBusca}
              aoAlterar={definirTermoBusca}
              placeholder="nome, telefone ou produto"
          />
          <FiltroTag tagIdSelecionada={tagIdFiltro} aoSelecionar={definirTagIdFiltro} />
        </div>

        {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}
        {mensagemAcao && <p role="alert" className="mensagem-erro">{mensagemAcao}</p>}
        {mensagemSucesso && <p role="status" className="mensagem-sucesso">{mensagemSucesso}</p>}

        {lembreteEmConclusao && (
            <FormularioInteracao
                key={lembreteEmConclusao.id}
                lembreteSelecionado={lembreteEmConclusao}
                aoRegistrar={aoRegistrarTentativa}
                aoConcluir={aoConcluirLembrete}
                aoCancelar={() => definirLembreteEmConclusao(null)}
            />
        )}

        {semMarcosAtivos && (
            <div className="cartao mensagem-vazia">
              nenhum marco ativo. o administrador cadastra os marcos de acompanhamento na tela Marcos.
            </div>
        )}

        {!semMarcosAtivos && (
            <ListaLembretes
                lembreteDestacadoId={lembreteDestacadoId}
                lembretesPendentes={lembretesFiltrados}
                filtroAtivo={filtroAtivo}
                estaCarregando={estaCarregando}
                lembreteEmAcao={lembreteEmAcao}
                aoAssumir={aoAssumirLembrete}
                aoLiberar={aoLiberarLembrete}
                aoConcluir={aoAbrirConclusao}
            />
        )}
      </div>
  );
}
