import { clienteHttp } from "./ClienteHttp";
import { type StatusLembrete } from "../tipos_compartilhados/TiposDominio";

// chamadas à API de interações (/interacoes) e o formato que o histórico devolve

export type InteracaoApi = {
  id: number;
  lembreteId: number;
  conteudo: string;
  respostaCliente: string | null;
  criadoEm: string;
  // preenchido quando o texto foi corrigido depois do registro
  editadoEm: string | null;
  usuario: { id: number; pessoa: { nome: string } };
  lembrete: { id: number; status: StatusLembrete; marco: { tipoMarco: { nome: string } } };
};

export type DadosEdicaoInteracao = {
  conteudo: string;
  respostaCliente: string;
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

// RF05: só o autor ou um admin, e só com o lembrete pendente (a API devolve 403/409 nos outros casos)
export async function editarInteracao(interacaoId: number, dadosEdicao: DadosEdicaoInteracao): Promise<InteracaoApi> {
  const respostaEdicao = await clienteHttp.patch(`/interacoes/${interacaoId}`, dadosEdicao);
  return respostaEdicao.data;
}
