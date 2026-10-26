import { z } from "zod";

export const validadorCadastroPessoa = z.object({
  nome: z.string().trim().min(1, "não pode ficar em branco"),
  email: z.string().email().optional(),
  cpf: z.string().min(1).optional(),
});

export const validadorEdicaoPessoa = z.object({
  nome: z.string().trim().min(1, "não pode ficar em branco").optional(),
  email: z.string().email().optional(),
  cpf: z.string().min(1).optional(),
});