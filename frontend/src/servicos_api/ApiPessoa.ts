import { clienteHttp } from "./ClienteHttp";

export type DadosPessoa = {
    id: number;
    nome: string;
    email: string | null;
    cpf: string | null;
    criadoEm: string;
};

// a API rejeita string vazia, então só se envia o que foi preenchido
export type DadosEnvioPessoa = {
    nome: string;
    email?: string;
    cpf?: string;
};

export async function listarPessoas(): Promise<DadosPessoa[]> {
    const resposta = await clienteHttp.get("/pessoas");
    return resposta.data;
}

export async function cadastrarPessoa(dadosPessoa: DadosEnvioPessoa): Promise<DadosPessoa> {
    const resposta = await clienteHttp.post("/pessoas", dadosPessoa);
    return resposta.data;
}

export async function editarPessoa(pessoaId: number, dadosPessoa: DadosEnvioPessoa): Promise<DadosPessoa> {
    const resposta = await clienteHttp.put(`/pessoas/${pessoaId}`, dadosPessoa);
    return resposta.data;
}

export async function excluirPessoa(pessoaId: number): Promise<void> {
    await clienteHttp.delete(`/pessoas/${pessoaId}`);
}