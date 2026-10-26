import { clienteHttp } from "./ClienteHttp";
import { type PessoaApi } from "./ApiCliente";
import { type VinculoTagApi } from "./ApiTag";
import { type StatusLembrete } from "../tipos_compartilhados/TiposDominio";

// chamadas à API de lembretes (/lembretes) e o formato que a listagem por marco devolve

export type LembreteApi = {
  id: number;
  status: StatusLembrete;
  criadoEm: string;
  marco: {
    id: number;
    dataAlvo: string;
    entrega: {
      id: number;
      dataEntrega: string;
      produto: string;
      cliente: {
        id: number;
        contato: string;
        pessoa: PessoaApi;
        tags?: VinculoTagApi[];
        // todas as entregas do cliente, da mais recente para a mais antiga (inclui a deste lembrete)
        entregas: EntregaResumoApi[];
      };
    };
  };
  emAtendimentos: { usuario: { id: number; pessoa: { nome: string } } } | null;
  // tentativas de contato já registradas neste lembrete, da mais antiga para a mais recente
  interacoes: TentativaContatoApi[];
};

export type EntregaResumoApi = {
  id: number;
  produto: string;
  dataEntrega: string;
};

export type TentativaContatoApi = {
  id: number;
  conteudo: string;
  respostaCliente: string | null;
  criadoEm: string;
  editadoEm: string | null;
  usuarioId: number;
  usuario: { pessoa: { nome: string } };
};

export async function listarLembretesPorMarco(tipoMarcoId: number): Promise<LembreteApi[]> {
  const respostaListagem = await clienteHttp.get(`/lembretes/marco/${tipoMarcoId}`);
  return respostaListagem.data;
}

// sem conteudo, conclui com as tentativas já registradas (a API exige pelo menos uma)
export type DadosConclusaoLembrete = {
  conteudo?: string;
  respostaCliente?: string;
};

// UC07: a última conversa, se houver, é gravada na mesma ação da conclusão
export async function concluirLembrete(lembreteId: number, dadosConclusao: DadosConclusaoLembrete): Promise<void> {
  await clienteHttp.patch(`/lembretes/${lembreteId}/concluir`, dadosConclusao);
}

export async function marcarEmAtendimento(lembreteId: number): Promise<void> {
  await clienteHttp.patch(`/lembretes/${lembreteId}/em-atendimento`);
}

export async function desmarcarEmAtendimento(lembreteId: number): Promise<void> {
  await clienteHttp.delete(`/lembretes/${lembreteId}/em-atendimento`);
}

// UC07 A3: só o admin desfaz uma conclusão feita por engano
export async function reabrirLembrete(lembreteId: number): Promise<void> {
  await clienteHttp.patch(`/lembretes/${lembreteId}/reabrir`);
}
