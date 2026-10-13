import { z } from "zod";
import { PapelAcesso } from "@prisma/client";

export const validadorCadastroAtendente = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  senha: z.string().min(8),
});

// papéis vêm do enum do Prisma — uma fonte só, se surgir papel novo no schema o validador acompanha
export const validadorEdicaoAtendente = z.object({
  nome: z.string().trim().min(1),
  email: z.string().email(),
  papelAcesso: z.nativeEnum(PapelAcesso),
});