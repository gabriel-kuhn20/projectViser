import { z } from "zod";

export const validadorCadastroTag = z.object({
  nome: z.string().min(1),
});

export const validadorEdicaoTag = z.object({
  nome: z.string().min(1),
});