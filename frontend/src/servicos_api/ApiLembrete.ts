import { clienteHttp } from "./ClienteHttp";
import { TipoMarco } from "../tipos_compartilhados/TiposDominio";

export async function listarLembretesPorMarco(tipoMarco: TipoMarco) {
  const resposta = await clienteHttp.get(`/lembretes/marco/${tipoMarco}`);
  return resposta.data;
}

export async function concluirLembrete(lembreteId: string) {
  const resposta = await clienteHttp.patch(`/lembretes/${lembreteId}/concluir`);
  return resposta.data;
}

export async function marcarEmAtendimento(lembreteId: string) {
  const resposta = await clienteHttp.patch(`/lembretes/${lembreteId}/em-atendimento`);
  return resposta.data;
}

export async function desmarcarEmAtendimento(lembreteId: string) {
  await clienteHttp.delete(`/lembretes/${lembreteId}/em-atendimento`);
}
