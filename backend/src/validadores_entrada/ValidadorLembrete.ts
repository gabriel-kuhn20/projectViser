import { z } from "zod";

// UC07: concluir pode vir com a interação junto (o que foi dito + resposta), registrando
// e concluindo numa ação só; sem conteúdo, exige interação já registrada
export const validadorConclusaoLembrete = z.object({
    conteudo: z.string().trim().min(1, "não pode ficar em branco").optional(),
    respostaCliente: z.string().trim().min(1, "não pode ficar em branco").optional(),
});

// contato antecipado: o cliente ligou ou passou na loja antes do marco vencer; a conversa
// já vem junto porque o lembrete só nasce quando há algo para registrar
export const validadorAntecipacaoLembrete = z.object({
    entregaId: z.number().int().positive(),
    tipoMarcoId: z.number().int().positive(),
    conteudo: z.string().trim().min(1, "não pode ficar em branco"),
    respostaCliente: z.string().trim().min(1, "não pode ficar em branco").optional(),
    concluir: z.boolean(),
});