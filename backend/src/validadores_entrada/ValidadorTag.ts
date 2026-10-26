import { z } from "zod";

// trim antes do min: "   " passava e virava uma tag em branco na lista
export const validadorCadastroTag = z.object({
  nome: z.string().trim().min(1, "não pode ficar em branco"),
});

// lista completa das tags do cliente — a que não vier é desvinculada
export const validadorTagsCliente = z.object({
  tagIds: z.array(z.number().int().positive()).max(50),
});

export const validadorEdicaoTag = z.object({
  nome: z.string().trim().min(1, "não pode ficar em branco"),
});