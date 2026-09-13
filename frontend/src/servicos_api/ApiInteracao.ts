import { clienteHttp } from "./ClienteHttp";

export async function listarHistoricoCliente(clienteId: string) {
  const resposta = await clienteHttp.get(`/interacoes/cliente/${clienteId}`);
  return resposta.data;
}

export async function registrarInteracao(dadosInteracao: unknown) {
  const resposta = await clienteHttp.post("/interacoes", dadosInteracao);
  return resposta.data;
}
