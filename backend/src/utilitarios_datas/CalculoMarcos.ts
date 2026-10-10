import { NomeTipoMarco } from "../tipos_compartilhados/TiposDominio";

const UM_DIA_EM_MS = 24 * 60 * 60 * 1000;

// tempo após a entrega em que cada marco é atingido — a mesma tabela serve para
// descobrir QUAIS marcos já passaram e QUANDO cada um passou
const tempoAteMarco: Record<NomeTipoMarco, number> = {
  "7d": 7 * UM_DIA_EM_MS,
  "2m": 60 * UM_DIA_EM_MS,
  "1a": 365 * UM_DIA_EM_MS,
};

// A2 (UC04): sem data de entrega não há como calcular os marcos; a chamada
// nem deveria acontecer nesse caso, quem chama filtra isso antes.
export function calcularMarcosAtingidos(dataEntrega: Date, dataReferencia: Date): NomeTipoMarco[] {
  const tempoDecorrido = dataReferencia.getTime() - dataEntrega.getTime();
  const nomesTipoMarco = Object.keys(tempoAteMarco) as NomeTipoMarco[];

  return nomesTipoMarco.filter((nomeTipoMarco) => tempoDecorrido >= tempoAteMarco[nomeTipoMarco]);
}

// data em que o marco foi atingido — não a data em que o agendador rodou: um cliente
// cadastrado com entrega antiga precisa aparecer com o marco na data real, senão a
// ordenação "quem espera há mais tempo primeiro" da lista de lembretes não funciona
export function calcularDataAlvoMarco(dataEntrega: Date, nomeTipoMarco: NomeTipoMarco): Date {
  return new Date(dataEntrega.getTime() + tempoAteMarco[nomeTipoMarco]);
}
