import { z } from "zod";

// data de entrega não pode ser futura: os marcos 7d/2m/1a são contados a partir
// dela — uma data futura geraria lembretes de um óculos que ainda não foi entregue
const validadorDataEntrega = z.coerce
    .date()
    .refine((dataEntrega) => dataEntrega <= new Date(), {
        message: "a data de entrega não pode ser futura",
    });

export const validadorCadastroEntrega = z.object({
    clienteId: z.number().int().positive(),
    dataEntrega: validadorDataEntrega,
});

export const validadorEdicaoEntrega = z.object({
    dataEntrega: validadorDataEntrega,
});