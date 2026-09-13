import { z } from "zod";

export const validadorCadastroCliente = z.object({
  nome: z.string().min(1),
  contato: z.string().min(1),
  atendenteId: z.string().uuid(),
  dataEntrega: z.coerce.date(),
});

export const validadorEdicaoCliente = z.object({
  nome: z.string().min(1).optional(),
  contato: z.string().min(1).optional(),
});
