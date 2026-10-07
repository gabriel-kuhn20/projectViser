import { z } from "zod";

// o cliente pode ser criado vinculando uma pessoa que já existe (pessoaId)
// ou criando a pessoa junto (nome) — exatamente um dos dois
export const validadorCadastroCliente = z
    .object({
      pessoaId: z.number().int().positive().optional(),
      nome: z.string().min(1).optional(),
      contato: z.string().min(1),
      endereco: z.string().min(1).optional(),
      responsavelId: z.number().int().positive().optional(),
      dataEntrega: z.coerce.date(),
    })
    .refine((dadosCliente) => (dadosCliente.pessoaId === undefined) !== (dadosCliente.nome === undefined), {
      message: "informe pessoaId (pessoa existente) ou nome (nova pessoa), não os dois",
      path: ["pessoaId"],
    });

export const validadorEdicaoCliente = z.object({
  nome: z.string().min(1).optional(),
  contato: z.string().min(1).optional(),
  endereco: z.string().min(1).optional(),
});