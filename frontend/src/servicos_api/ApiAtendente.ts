import { clienteHttp } from "./ClienteHttp";

export async function cadastrarAtendente(dadosAtendente: unknown) {
  const resposta = await clienteHttp.post("/atendentes", dadosAtendente);
  return resposta.data;
}
