import { z } from "zod";

export const validadorCadastroPessoa = z.object({
  nome: z.string().min(1),
  email: z.string().email().optional(),
  cpf: z.string().min(1).optional(),
});

export const validadorEdicaoPessoa = z.object({
  nome: z.string().min(1).optional(),
  email: z.string().email().optional(),
  cpf: z.string().min(1).optional(),
});