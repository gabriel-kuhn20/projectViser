import { z } from "zod";

export const validadorRegistroInteracao = z.object({
  lembreteId: z.number().int().positive(),
  // trim antes do min: um contato registrado só com espaços liberava a conclusão do lembrete (UC08 exige o registro)
  conteudo: z.string().trim().min(1, "não pode ficar em branco"),
  respostaCliente: z.string().trim().min(1, "não pode ficar em branco").optional(),


});

export const validadorRespostaInteracao = z.object({
  respostaCliente: z.string().trim().min(1, "não pode ficar em branco"),
});