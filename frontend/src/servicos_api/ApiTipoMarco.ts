import { clienteHttp } from "./ClienteHttp";

// chamadas à API de marcos (/tipos-marco): o administrador define em quantos dias após a entrega
// acontece cada contato de acompanhamento

export type TipoMarcoApi = {
  id: number;
  nome: string;
  diasAposEntrega: number;
  ativo: boolean;
  criadoEm: string;
  // quantos marcos de clientes ele já gerou — com algum, os dias não mudam e ele não é excluído
  _count?: { marcos: number };
};

export type DadosTipoMarco = {
  nome: string;
  diasAposEntrega: number;
};

export async function listarTiposMarco(): Promise<TipoMarcoApi[]> {
  const resposta = await clienteHttp.get("/tipos-marco");
  return resposta.data;
}

export async function cadastrarTipoMarco(dadosMarco: DadosTipoMarco): Promise<TipoMarcoApi> {
  const resposta = await clienteHttp.post("/tipos-marco", dadosMarco);
  return resposta.data;
}

export async function editarTipoMarco(
    tipoMarcoId: number,
    dadosMarco: Partial<DadosTipoMarco> & { ativo?: boolean }
): Promise<TipoMarcoApi> {
  const resposta = await clienteHttp.put(`/tipos-marco/${tipoMarcoId}`, dadosMarco);
  return resposta.data;
}

export async function excluirTipoMarco(tipoMarcoId: number): Promise<void> {
  await clienteHttp.delete(`/tipos-marco/${tipoMarcoId}`);
}
