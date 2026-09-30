import { clienteHttp } from "./ClienteHttp";

export type DadosTag = {
    id: number;
    nome: string;
    criadoEm: string;
};

export async function listarTags(): Promise<DadosTag[]> {
    const resposta = await clienteHttp.get("/tags");
    return resposta.data;
}

export async function buscarTagPorId(tagId: number): Promise<DadosTag> {
    const resposta = await clienteHttp.get(`/tags/${tagId}`);
    return resposta.data;
}

export async function cadastrarTag(nome: string): Promise<DadosTag> {
    const resposta = await clienteHttp.post("/tags", { nome });
    return resposta.data;
}

export async function editarTag(tagId: number, nome: string): Promise<DadosTag> {
    const resposta = await clienteHttp.put(`/tags/${tagId}`, { nome });
    return resposta.data;
}

export async function excluirTag(tagId: number): Promise<void> {
    await clienteHttp.delete(`/tags/${tagId}`);
}