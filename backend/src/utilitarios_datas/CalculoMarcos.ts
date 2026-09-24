import { NomeTipoMarco } from "../utilitarios_datas/TiposDominio";

const SETE_DIAS_EM_MS = 7 * 24 * 60 * 60 * 1000;
const DOIS_MESES_EM_MS = 60 * 24 * 60 * 60 * 1000;
const UM_ANO_EM_MS = 365 * 24 * 60 * 60 * 1000;

// A2 (UC04): sem data de entrega não há como calcular os marcos; a chamada
// nem deveria acontecer nesse caso, quem chama filtra isso antes.
export function calcularMarcosAtingidos(dataEntrega: Date, dataReferencia: Date): NomeTipoMarco[] {
  const tempoDecorrido = dataReferencia.getTime() - dataEntrega.getTime();
  const marcosAtingidos: NomeTipoMarco[] = [];

  if (tempoDecorrido >= SETE_DIAS_EM_MS) marcosAtingidos.push("7d");
  if (tempoDecorrido >= DOIS_MESES_EM_MS) marcosAtingidos.push("2m");
  if (tempoDecorrido >= UM_ANO_EM_MS) marcosAtingidos.push("1a");

  return marcosAtingidos;
}