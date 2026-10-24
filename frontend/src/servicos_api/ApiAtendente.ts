import { clienteHttp } from "./ClienteHttp";
import { type PapelAcesso } from "../tipos_compartilhados/TiposDominio";

// chamadas à API de contas da equipe (/atendentes) e o formato que ela devolve (sem senha)

export type AtendenteApi = {
  id: number;
  email: string;
  papelAcesso: PapelAcesso;
  criadoEm: string;
  pessoa: { nome: string };
};

export type DadosCadastroAtendente = {
  nome: string;
  email: string;
  senha: string;
};

export type DadosEdicaoAtendente = {
  nome: string;
  email: string;
  papelAcesso: PapelAcesso;
};

export async function listarAtendentes(): Promise<AtendenteApi[]> {
  const respostaListagem = await clienteHttp.get("/atendentes");
  return respostaListagem.data;
}

export async function cadastrarAtendente(dadosAtendente: DadosCadastroAtendente): Promise<{ id: number; nome: string }> {
  const resposta = await clienteHttp.post("/atendentes", dadosAtendente);
  return resposta.data;
}

export async function editarAtendente(usuarioId: number, dadosAtendente: DadosEdicaoAtendente): Promise<AtendenteApi> {
  const resposta = await clienteHttp.put(`/atendentes/${usuarioId}`, dadosAtendente);
  return resposta.data;
}

export async function excluirAtendente(usuarioId: number): Promise<void> {
  await clienteHttp.delete(`/atendentes/${usuarioId}`);
}
