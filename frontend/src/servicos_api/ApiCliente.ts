import { clienteHttp } from "./ClienteHttp";

export async function cadastrarCliente(dadosCliente: unknown) {
  const resposta = await clienteHttp.post("/clientes", dadosCliente);
  return resposta.data;
}

export async function editarCliente(clienteId: string, dadosCliente: unknown) {
  const resposta = await clienteHttp.put(`/clientes/${clienteId}`, dadosCliente);
  return resposta.data;
}
