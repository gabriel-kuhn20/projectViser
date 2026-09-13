export function formatarDataBr(data: string | Date): string {
  return new Date(data).toLocaleDateString("pt-BR");
}
