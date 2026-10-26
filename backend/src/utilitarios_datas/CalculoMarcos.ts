const UM_DIA_EM_MS = 24 * 60 * 60 * 1000;

// o que o cálculo precisa de cada marco cadastrado (UC04): o id e quantos dias após a entrega ele vence
export type RegraMarco = { id: number; diasAposEntrega: number };

// A2 (UC04): sem data de entrega não há como calcular os marcos; a chamada
// nem deveria acontecer nesse caso, quem chama filtra isso antes.
// devolve os marcos já vencidos, do mais curto para o mais longo
export function calcularMarcosAtingidos<TipoRegra extends RegraMarco>(
    dataEntrega: Date,
    dataReferencia: Date,
    regrasMarco: TipoRegra[]
): TipoRegra[] {
  const tempoDecorrido = dataReferencia.getTime() - dataEntrega.getTime();

  return regrasMarco
      .filter((regraMarco) => tempoDecorrido >= regraMarco.diasAposEntrega * UM_DIA_EM_MS)
      .sort((regraA, regraB) => regraA.diasAposEntrega - regraB.diasAposEntrega);
}

// data em que o marco foi atingido — não a data em que o agendador rodou: um cliente
// cadastrado com entrega antiga precisa aparecer com o marco na data real, senão a
// ordenação "quem espera há mais tempo primeiro" da lista de lembretes não funciona
export function calcularDataAlvoMarco(dataEntrega: Date, diasAposEntrega: number): Date {
  return new Date(dataEntrega.getTime() + diasAposEntrega * UM_DIA_EM_MS);
}

// marco criado pelo administrador depois da entrega não vale para o passado: sem isso, criar um
// marco de 30 dias jogaria de uma vez na lista todo cliente com entrega de mais de 30 dias.
// Entrega cadastrada depois do marco existir (mesmo com data antiga) recebe todos, como no UC04
export function verificarMarcoValeParaEntrega(
    dataAlvo: Date,
    entregaCadastradaEm: Date,
    marcoCriadoEm: Date
): boolean {
  const entregaPosteriorAoMarco = entregaCadastradaEm.getTime() >= marcoCriadoEm.getTime();
  if (entregaPosteriorAoMarco) return true;

  const inicioDiaCriacaoMarco = new Date(marcoCriadoEm);
  inicioDiaCriacaoMarco.setUTCHours(0, 0, 0, 0);
  return dataAlvo.getTime() >= inicioDiaCriacaoMarco.getTime();
}
