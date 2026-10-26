import { z } from "zod";

// UC07: concluir pode vir com a interação junto (o que foi dito + resposta), registrando
// e concluindo numa ação só; sem conteúdo, exige interação já registrada
export const validadorConclusaoLembrete = z.object({
    conteudo: z.string().trim().min(1, "não pode ficar em branco").optional(),
    respostaCliente: z.string().trim().min(1, "não pode ficar em branco").optional(),
});