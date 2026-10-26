import { clienteHttp } from "./ClienteHttp";
import { type PessoaApi } from "./ApiCliente";

// chamadas à API do painel (/painel) e o formato que ela devolve

export type PendenciasMarcoApi = {
  id: number;
  nome: string;
  diasAposEntrega: number;
  pendentes: number;
  // esperando há mais de 7 dias desde que o marco venceu
  atrasados: number;
};

export type LembretePainelApi = {
  id: number;
  marco: {
    dataAlvo: string;
    tipoMarco: { id: number; nome: string };
    entrega: { produto: string; cliente: { id: number; contato: string; pessoa: Pick<PessoaApi, "nome"> } };
  };
};

export type ContatosAtendenteApi = { usuarioId: number; nome: string; hoje: number; semana: number };

export type PainelApi = {
  marcos: PendenciasMarcoApi[];
  meusAtendimentos: { iniciadoEm: string; lembrete: LembretePainelApi }[];
  proximoCliente: LembretePainelApi | null;
  // atendente: só os próprios contatos; admin: todos, e porAtendente preenchido
  contatos: { hoje: number; semana: number; porAtendente: ContatosAtendenteApi[] };
};

export async function obterPainel(): Promise<PainelApi> {
  const respostaPainel = await clienteHttp.get("/painel");
  return respostaPainel.data;
}
