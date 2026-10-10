import { clienteHttp } from "./ClienteHttp";
import { type PessoaApi } from "./ApiCliente";
import { type StatusLembrete, type TipoMarco } from "../tipos_compartilhados/TiposDominio";

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
      cliente: { id: number; contato: string; pessoa: PessoaApi };
    };
  };
  emAtendimentos: { usuario: { id: number; pessoa: { nome: string } } } | null;
};

export async function listarLembretesPorMarco(tipoMarco: TipoMarco): Promise<LembreteApi[]> {
  const respostaListagem = await clienteHttp.get(`/lembretes/marco/${tipoMarco}`);
  return respostaListagem.data;
}

export async function concluirLembrete(lembreteId: number): Promise<void> {
  await clienteHttp.patch(`/lembretes/${lembreteId}/concluir`);
}

export async function marcarEmAtendimento(lembreteId: number): Promise<void> {
  await clienteHttp.patch(`/lembretes/${lembreteId}/em-atendimento`);
}

export async function desmarcarEmAtendimento(lembreteId: number): Promise<void> {
  await clienteHttp.delete(`/lembretes/${lembreteId}/em-atendimento`);
}