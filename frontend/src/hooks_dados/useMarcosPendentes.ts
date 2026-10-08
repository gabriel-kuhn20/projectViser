import { useCallback, useEffect, useState } from "react";
import { listarLembretesPorMarco, type LembreteApi } from "../servicos_api/ApiLembrete";
import { type TipoMarco } from "../tipos_compartilhados/TiposDominio";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

// carrega os lembretes pendentes do marco escolhido e expõe recarregarLembretes para a
// tela atualizar a lista depois de uma ação (assumir, liberar, concluir).
// O prefixo "use" do arquivo segue a mesma exceção explicada em useAutenticacao.ts
export function usarMarcosPendentes(tipoMarco: TipoMarco) {
  const [lembretesPendentes, definirLembretesPendentes] = useState<LembreteApi[]>([]);
  const [estaCarregando, definirEstaCarregando] = useState(true);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);

  const recarregarLembretes = useCallback(async () => {
    definirEstaCarregando(true);
    try {
      definirLembretesPendentes(await listarLembretesPorMarco(tipoMarco));
      definirMensagemErro(null);
    } catch (erroRequisicao) {
      definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível carregar os lembretes."));
    } finally {
      definirEstaCarregando(false);
    }
  }, [tipoMarco]);

  // ao trocar de marco, limpa a lista antes de buscar para não mostrar por um instante
  // os clientes do marco anterior
  useEffect(() => {
    definirLembretesPendentes([]);
    recarregarLembretes();
  }, [recarregarLembretes]);

  return { lembretesPendentes, estaCarregando, mensagemErro, recarregarLembretes };
}