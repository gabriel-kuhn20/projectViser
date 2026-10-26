import { useCallback, useEffect, useState } from "react";
import { listarLembretesPorMarco, type LembreteApi } from "../servicos_api/ApiLembrete";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

// carrega os lembretes pendentes do marco escolhido e expõe recarregarLembretes para a
// tela atualizar a lista depois de uma ação (assumir, liberar, concluir).
// O prefixo "use" do arquivo segue a mesma exceção explicada em useAutenticacao.ts
// tipoMarcoId nulo: os marcos ainda não chegaram da API (ou nenhum está ativo) e não há o que buscar
export function usarMarcosPendentes(tipoMarcoId: number | null) {
  const [lembretesPendentes, definirLembretesPendentes] = useState<LembreteApi[]>([]);
  const [estaCarregando, definirEstaCarregando] = useState(true);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);

  const recarregarLembretes = useCallback(async () => {
    if (tipoMarcoId === null) return;
    definirEstaCarregando(true);
    try {
      definirLembretesPendentes(await listarLembretesPorMarco(tipoMarcoId));
      definirMensagemErro(null);
    } catch (erroRequisicao) {
      definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível carregar os lembretes."));
    } finally {
      definirEstaCarregando(false);
    }
  }, [tipoMarcoId]);

  // ao trocar de marco, limpa a lista antes de buscar para não mostrar por um instante
  // os clientes do marco anterior
  useEffect(() => {
    definirLembretesPendentes([]);
    recarregarLembretes();
  }, [recarregarLembretes]);

  return { lembretesPendentes, estaCarregando, mensagemErro, recarregarLembretes };
}