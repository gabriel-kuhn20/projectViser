import { clienteHttp } from "./ClienteHttp";
import { type TipoMarco } from "../tipos_compartilhados/TiposDominio";

// chamadas à API de interações (/interacoes) e o formato que o histórico devolve

export type InteracaoApi = {
  id: number;
  lembreteId: number;
  conteudo: string;
  respostaCliente: string | null;
  criadoEm: string;
  usuario: { id: number; pessoa: { nome: string } };
  lembrete: { id: number; marco: { tipoMarco: { nome: TipoMarco } } };
};

export type DadosRegistroInteracao = {
  lembreteId: number;
  conteudo: string;
  respostaCliente?: string;
};

export async function listarHistoricoCliente(clienteId: number): Promise<InteracaoApi[]> {
  const respostaListagem = await clienteHttp.get(`/interacoes/cliente/${clienteId}`);
  return respostaListagem.data;
}

export async function registrarInteracao(dadosInteracao: DadosRegistroInteracao): Promise<void> {
  await clienteHttp.post("/interacoes", dadosInteracao);
}