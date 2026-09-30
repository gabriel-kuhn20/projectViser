import { clienteHttp } from "./ClienteHttp";

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

type ClienteBruto = {
  id: number;
  pessoaId: number;
  contato: string;
  endereco?: string | null;
  responsavelId?: number | null;
  criadoEm: string;
};

type PessoaDetalheApi = PessoaApi & {
  criadoEm: string;
  usuario?: { id: number; email: string } | null;
  clientes: ClienteBruto[];
};

export async function cadastrarCliente(dadosCliente: DadosCadastroCliente): Promise<ClienteApi> {
  const resposta = await clienteHttp.post("/clientes", dadosCliente);
  return resposta.data;
}

export async function editarCliente(clienteId: number, dadosCliente: DadosEdicaoCliente): Promise<ClienteApi> {
  const resposta = await clienteHttp.put(`/clientes/${clienteId}`, dadosCliente);
  return resposta.data;
}

// A API ainda não tem uma rota GET /clientes dedicada (RotaCliente só expõe
// POST e PUT). Enquanto isso não existe, listamos por /pessoas — toda pessoa
// que também é cliente aparece com o array `clientes` preenchido em
// GET /pessoas/:id — e montamos o formato ClienteApi a partir disso.
export async function listarClientes(): Promise<ClienteApi[]> {
  const { data: pessoasResposta } = await clienteHttp.get<PessoaApi[]>("/pessoas");
  const pessoas = Array.isArray(pessoasResposta) ? pessoasResposta : [];

  const detalhes = await Promise.all(
      pessoas.map((pessoa) =>
          clienteHttp.get<PessoaDetalheApi>(`/pessoas/${pessoa.id}`).then((resposta) => resposta.data)
      )
  );

  return detalhes
      .filter((pessoa) => Array.isArray(pessoa.clientes) && pessoa.clientes.length > 0)
      .map((pessoa) => {
        const cliente = pessoa.clientes[0];
        return {
          id: cliente.id,
          pessoaId: pessoa.id,
          contato: cliente.contato,
          endereco: cliente.endereco,
          responsavelId: cliente.responsavelId,
          criadoEm: cliente.criadoEm,
          pessoa: { id: pessoa.id, nome: pessoa.nome, email: pessoa.email, cpf: pessoa.cpf },
        };
      });
}

// Não existe DELETE /clientes/:id — excluímos pela pessoa vinculada
// (DELETE /pessoas/:pessoaId), que já faz a cascata completa do lado do
// cliente (entregas, marcos, lembretes, vínculos de tag etc.).
export async function excluirCliente(pessoaId: number): Promise<void> {
  await clienteHttp.delete(`/pessoas/${pessoaId}`);
}