import { z } from "zod";

export const validadorCadastroAtendente = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  senha: z.string().min(8),
});
