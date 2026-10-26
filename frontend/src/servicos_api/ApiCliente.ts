import { clienteHttp } from "./ClienteHttp";
import { type VinculoTagApi } from "./ApiTag";

// chamadas à API de clientes (/clientes) e os tipos que ela devolve

export type PessoaApi = {
  id: number;
  nome: string;
  email?: string | null;
  cpf?: string | null;
};

export type EntregaApi = {
  id: number;
  dataEntrega: string;
  produto: string;
};

export type ClienteApi = {
  id: number;
  pessoaId: number;
  contato: string;
  endereco?: string | null;
  responsavelId?: number | null;
  criadoEm: string;
  pessoa: PessoaApi;
  responsavel?: { id: number; pessoa: { nome: string } } | null;
  tags?: VinculoTagApi[];
  // só a busca por id devolve as entregas (tela do cliente, RF18)
  entregas?: EntregaApi[];
};

export type DadosCadastroCliente = {
  nome: string;
  contato: string;
  endereco?: string;
  responsavelId?: number;
  dataEntrega: string;
  produto: string;
};

export type DadosEdicaoCliente = {
  nome?: string;
  contato?: string;
  endereco?: string;
  // null tira o responsável; ausente mantém o atual
  responsavelId?: number | null;
};

export async function cadastrarCliente(dadosCliente: DadosCadastroCliente): Promise<ClienteApi> {
  const resposta = await clienteHttp.post("/clientes", dadosCliente);
  return resposta.data;
}

export async function editarCliente(clienteId: number, dadosCliente: DadosEdicaoCliente): Promise<ClienteApi> {
  const resposta = await clienteHttp.put(`/clientes/${clienteId}`, dadosCliente);
  return resposta.data;
}

export async function buscarClientePorId(clienteId: number): Promise<ClienteApi> {
  const respostaBusca = await clienteHttp.get(`/clientes/${clienteId}`);
  return respostaBusca.data;
}

export type FiltrosListagemClientes = {
  busca?: string;
  tagId?: number | null;
  pagina?: number;
};

// mesmo tamanho de página do backend (CLIENTES_POR_PAGINA em ControleCliente.ts)
export const CLIENTES_POR_PAGINA = 20;

// a lista vem paginada do servidor para a tela não baixar a base inteira
export type PaginaClientesApi = {
  clientes: ClienteApi[];
  total: number;
  pagina: number;
  totalPaginas: number;
};

export async function listarClientes(filtrosListagem: FiltrosListagemClientes = {}): Promise<PaginaClientesApi> {
  const respostaListagem = await clienteHttp.get("/clientes", {
    params: {
      busca: filtrosListagem.busca || undefined,
      tagId: filtrosListagem.tagId ?? undefined,
      pagina: filtrosListagem.pagina ?? 1,
    },
  });
  return respostaListagem.data;
}

export async function excluirCliente(clienteId: number): Promise<void> {
  await clienteHttp.delete(`/clientes/${clienteId}`);
}

// a API troca o conjunto inteiro: as tags fora da lista são desvinculadas
export async function definirTagsCliente(clienteId: number, tagIds: number[]): Promise<ClienteApi> {
  const resposta = await clienteHttp.put(`/clientes/${clienteId}/tags`, { tagIds });
  return resposta.data;
}
