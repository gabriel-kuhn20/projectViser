import { z } from "zod";
import { PapelAcesso } from "@prisma/client";

// o e-mail é gravado sempre em minúsculas: "ADMIN@..." e "admin@..." são a mesma caixa de entrada.
// O login e a recuperação de senha usam este mesmo validador, então acham a conta com qualquer caixa digitada
export const validadorEmailConta = z.string().trim().toLowerCase().email();

// papel opcional: sem ele a conta nasce como atendente, como antes de o cadastro deixar escolher
export const validadorCadastroAtendente = z.object({
  nome: z.string().trim().min(1, "não pode ficar em branco"),
  email: validadorEmailConta,
  senha: z.string().min(8),
  papelAcesso: z.nativeEnum(PapelAcesso).default(PapelAcesso.atendente),
});

// papéis vêm do enum do Prisma — uma fonte só, se surgir papel novo no schema o validador acompanha
export const validadorEdicaoAtendente = z.object({
  nome: z.string().trim().min(1, "não pode ficar em branco"),
  email: validadorEmailConta,
  papelAcesso: z.nativeEnum(PapelAcesso),
});

export const validadorSituacaoAtendente = z.object({
  ativo: z.boolean(),
});