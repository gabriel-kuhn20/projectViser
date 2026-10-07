import { clienteHttp } from "./ClienteHttp";

// chamadas à API de clientes (/clientes) e os tipos que ela devolve

export type PessoaApi = {
  id: number;
  nome: string;
  email?: string | null;
  cpf?: string | null;
};

export type ClienteApi = {
  id: number;
  pessoaId: number;
  contato: string;
  endereco?: string | null;
  responsavelId?: number | null;
  criadoEm: string;
  pessoa: PessoaApi;
};

export type DadosCadastroCliente = {
  nome: string;
  contato: string;
  endereco?: string;
  dataEntrega: string;
};

export type DadosEdicaoCliente = {
  nome?: string;
  contato?: string;
  endereco?: string;
};

export async function cadastrarCliente(dadosCliente: DadosCadastroCliente): Promise<ClienteApi> {
  const resposta = await clienteHttp.post("/clientes", dadosCliente);
  return resposta.data;
}

export async function editarCliente(clienteId: number, dadosCliente: DadosEdicaoCliente): Promise<ClienteApi> {
  const resposta = await clienteHttp.put(`/clientes/${clienteId}`, dadosCliente);
  return resposta.data;
}

export async function listarClientes(): Promise<ClienteApi[]> {
  const respostaListagem = await clienteHttp.get("/clientes");
  return respostaListagem.data;
}

export async function excluirCliente(clienteId: number): Promise<void> {
  await clienteHttp.delete(`/clientes/${clienteId}`);
}