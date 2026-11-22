import { clienteHttp } from "./ClienteHttp";
import { type EntregaApi } from "./ApiCliente";

export type DadosCadastroEntrega = {
  clienteId: number;
  dataEntrega: string;
  produto: string;
  tiposMarcoIgnorados?: number[];
};

// RF02: um cliente já cadastrado pode receber novas entregas (compra de outro óculos)
export type DadosEdicaoEntrega = {
  dataEntrega: string;
  produto: string;
};

// trocar a data recalcula os marcos; a API recusa (409) se algum lembrete da compra já teve atendimento
export async function editarEntrega(entregaId: number, dadosEntrega: DadosEdicaoEntrega): Promise<EntregaApi> {
  const resposta = await clienteHttp.put(`/entregas/${entregaId}`, dadosEntrega);
  return resposta.data;
}

// RNF06: atendente só exclui compra sem contato registrado; com contato, só o admin
export async function excluirEntrega(entregaId: number): Promise<void> {
  await clienteHttp.delete(`/entregas/${entregaId}`);
}

export async function cadastrarEntrega(dadosEntrega: DadosCadastroEntrega): Promise<EntregaApi> {
  const resposta = await clienteHttp.post("/entregas", dadosEntrega);
  return resposta.data;
}
