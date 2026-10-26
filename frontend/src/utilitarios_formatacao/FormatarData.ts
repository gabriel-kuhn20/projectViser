export function formatarDataBr(data: string | Date): string {
  return new Date(data).toLocaleDateString("pt-BR");
}

// dataEntrega e dataAlvo (entrega + dias inteiros) são só data e vêm como meia-noite em UTC;
// formatar no fuso local mostraria o dia anterior no Brasil, por isso o timeZone fixo
export function formatarDataSemHora(dataSemHora: string): string {
  return new Date(dataSemHora).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

const UM_DIA_EM_MS = 24 * 60 * 60 * 1000;

// dias inteiros desde que o marco foi atingido; a dataAlvo é meia-noite em UTC, então
// "hoje" também é montado como meia-noite UTC da data local — senão à noite no Brasil
// (já é o dia seguinte em UTC) a contagem pularia um dia
export function calcularDiasAguardando(dataAlvo: string): number {
  const agora = new Date();
  const hojeUtc = Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const diasAguardando = Math.floor((hojeUtc - new Date(dataAlvo).getTime()) / UM_DIA_EM_MS);
  return Math.max(diasAguardando, 0);
}

export function formatarDiasAguardando(diasAguardando: number): string {
  if (diasAguardando === 0) return "aguardando desde hoje";
  if (diasAguardando === 1) return "aguardando há 1 dia";
  return `aguardando há ${diasAguardando} dias`;
}
