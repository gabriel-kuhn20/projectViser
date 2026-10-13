import { z } from "zod";

export const validadorRegistroInteracao = z.object({
  lembreteId: z.number().int().positive(),
  conteudo: z.string().min(1),
  respostaCliente: z.string().optional(),


});

export const validadorRespostaInteracao = z.object({
  respostaCliente: z.string().trim().min(1),
});