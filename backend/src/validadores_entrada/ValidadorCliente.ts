import { z } from "zod";
import { validadorDataEntrega, validadorProduto } from "./ValidadorEntrega";

// o cliente pode ser criado vinculando uma pessoa que já existe (pessoaId)
// ou criando a pessoa junto (nome) — exatamente um dos dois
export const validadorCadastroCliente = z
    .object({
      pessoaId: z.number().int().positive().optional(),
      // trim antes do min: só espaços passava e criava cliente sem nome/contato
      nome: z.string().trim().min(1, "não pode ficar em branco").optional(),
      contato: z.string().trim().min(1, "não pode ficar em branco"),
      endereco: z.string().trim().min(1, "não pode ficar em branco").optional(),
      responsavelId: z.number().int().positive().optional(),
      // mesma regra da rota de entregas — sem ela o cadastro aceitava a data futura que /entregas recusa
      dataEntrega: validadorDataEntrega,
      // RF02: a primeira entrega nasce junto com o cliente, já com o produto
      produto: validadorProduto,
    })
    .refine((dadosCliente) => (dadosCliente.pessoaId === undefined) !== (dadosCliente.nome === undefined), {
      message: "informe pessoaId (pessoa existente) ou nome (nova pessoa), não os dois",
      path: ["pessoaId"],
    });

export const validadorEdicaoCliente = z.object({
  nome: z.string().trim().min(1, "não pode ficar em branco").optional(),
  contato: z.string().trim().min(1, "não pode ficar em branco").optional(),
  endereco: z.string().trim().min(1, "não pode ficar em branco").optional(),
  // null tira o responsável (ex: atendente que saiu da ótica)
  responsavelId: z.number().int().positive().nullable().optional(),
});

// GET /clientes?busca=&tagId=&pagina= — a lista vem paginada do servidor para a tela não
// baixar a base inteira (RNF01: 5.000 clientes)
export const validadorListagemClientes = z.object({
  busca: z.string().trim().max(100).optional().default(""),
  tagId: z.coerce.number().int().positive().optional(),
  pagina: z.coerce.number().int().positive().optional().default(1),
});
