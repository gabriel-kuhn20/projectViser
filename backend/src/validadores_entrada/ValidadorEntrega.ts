import { z } from "zod";

// data de entrega não pode ser futura: os marcos 7d/2m/1a são contados a partir
// dela — uma data futura geraria lembretes de um óculos que ainda não foi entregue
export const validadorDataEntrega = z.coerce
    .date()
    .refine((dataEntrega) => dataEntrega <= new Date(), {
        message: "a data de entrega não pode ser futura",
    });

// RF02: produto comprado em texto livre, obrigatório (PRD seção 8 — não há catálogo de produtos)
export const validadorProduto = z.string().trim().min(1, "não pode ficar em branco");

// marcos que não geram lembrete para esta compra; ausente = todos geram (comportamento padrão)
export const validadorTiposMarcoIgnorados = z.array(z.number().int().positive()).optional().default([]);

export const validadorCadastroEntrega = z.object({
    clienteId: z.number().int().positive(),
    dataEntrega: validadorDataEntrega,
    produto: validadorProduto,
    tiposMarcoIgnorados: validadorTiposMarcoIgnorados,
});

export const validadorEdicaoEntrega = z.object({
    dataEntrega: validadorDataEntrega,
    produto: validadorProduto.optional(),
});