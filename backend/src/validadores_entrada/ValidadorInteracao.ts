import { z } from "zod";

export const validadorRegistroInteracao = z.object({
  lembreteId: z.string().uuid(),
  conteudo: z.string().min(1),
  respostaCliente: z.string().optional(),
});
