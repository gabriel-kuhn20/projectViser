import { clienteHttp } from "./ClienteHttp";
import { type TipoMarco } from "../tipos_compartilhados/TiposDominio";

// chamadas à API do painel (/painel) e o formato do resumo de pendências

export type ResumoPendenciasApi = Record<TipoMarco, number>;

export async function obterResumoPendencias(): Promise<ResumoPendenciasApi> {
    const respostaResumo = await clienteHttp.get("/painel");
    return respostaResumo.data;
}