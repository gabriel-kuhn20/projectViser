// espelham os enums do backend/prisma/schema.prisma e os nomes da tabela tipo_marco (seed.ts)

export type TipoMarco = "7d" | "2m" | "1a";
// ordem em que os marcos aparecem nas abas de lembretes e nos cartões do painel
export const tiposMarcoDisponiveis: TipoMarco[] = ["7d", "2m", "1a"];

export type StatusLembrete = "pendente" | "concluido";
export type PapelAcesso = "admin" | "atendente";


// nome do marco do jeito que a atendente fala, para exibir na tela
export const rotulosTipoMarco: Record<TipoMarco, string> = {
    "7d": "7 dias",
    "2m": "2 meses",
    "1a": "1 ano",
};
