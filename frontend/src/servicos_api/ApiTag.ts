import { clienteHttp } from "./ClienteHttp";

export type TagApi = {
  id: number;
  nome: string;
  criadoEm: string;
};

export async function listarTags(): Promise<TagApi[]> {
  const resposta = await clienteHttp.get("/tags");
  return Array.isArray(resposta.data) ? resposta.data : [];
}

export async function cadastrarTag(nome: string): Promise<TagApi> {
  const resposta = await clienteHttp.post("/tags", { nome });
  return resposta.data;
}

export async function editarTag(tagId: number, nome: string): Promise<TagApi> {
  const resposta = await clienteHttp.put(`/tags/${tagId}`, { nome });
  return resposta.data;
}

export async function excluirTag(tagId: number): Promise<void> {
  await clienteHttp.delete(`/tags/${tagId}`);
}
