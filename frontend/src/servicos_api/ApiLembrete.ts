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
      cliente: { id: number; contato: string; pessoa: PessoaApi; tags?: VinculoTagApi[] };
    };
  };
  emAtendimentos: { usuario: { id: number; pessoa: { nome: string } } } | null;
};

export async function listarLembretesPorMarco(tipoMarcoId: number): Promise<LembreteApi[]> {
  const respostaListagem = await clienteHttp.get(`/lembretes/marco/${tipoMarcoId}`);
  return respostaListagem.data;
}

export type DadosConclusaoLembrete = {
  conteudo: string;
  respostaCliente?: string;
};

// UC07: a interação vai junto e é gravada na mesma ação da conclusão
export async function concluirLembrete(lembreteId: number, dadosConclusao: DadosConclusaoLembrete): Promise<void> {
  await clienteHttp.patch(`/lembretes/${lembreteId}/concluir`, dadosConclusao);
}

export async function marcarEmAtendimento(lembreteId: number): Promise<void> {
  await clienteHttp.patch(`/lembretes/${lembreteId}/em-atendimento`);
}

export async function desmarcarEmAtendimento(lembreteId: number): Promise<void> {
  await clienteHttp.delete(`/lembretes/${lembreteId}/em-atendimento`);
}