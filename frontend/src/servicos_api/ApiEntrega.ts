import { clienteHttp } from "./ClienteHttp";
import { type EntregaApi } from "./ApiCliente";

export type DadosCadastroEntrega = {
  clienteId: number;
  dataEntrega: string;
  produto: string;
};

// RF02: um cliente já cadastrado pode receber novas entregas (compra de outro óculos)
export async function cadastrarEntrega(dadosEntrega: DadosCadastroEntrega): Promise<EntregaApi> {
  const resposta = await clienteHttp.post("/entregas", dadosEntrega);
  return resposta.data;
}
