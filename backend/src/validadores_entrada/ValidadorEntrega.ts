import { z } from "zod";

// "AAAA-MM-DD" no começo do texto, que é como a tela manda a data
const PADRAO_DIA_DIGITADO = /^(\d{4}-\d{2}-\d{2})/;

// o `Date` do JavaScript não recusa dia inexistente: "2026-02-31" vira 03/03/2026 sem erro,
// e a entrega seria gravada (e os marcos contados) num dia que ninguém digitou. Por isso a
// data só vale se, convertida, continuar no mesmo dia que veio no texto
function verificarDiaExistente(valorRecebido: unknown) {
    if (typeof valorRecebido !== "string") return true;
    const diaDigitado = PADRAO_DIA_DIGITADO.exec(valorRecebido)?.[1];
    if (!diaDigitado) return true;

    const dataConvertida = new Date(diaDigitado);
    if (Number.isNaN(dataConvertida.getTime())) return false;
    return dataConvertida.toISOString().slice(0, 10) === diaDigitado;
}

// data de entrega não pode ser futura: os marcos 7d/2m/1a são contados a partir
// dela — uma data futura geraria lembretes de um óculos que ainda não foi entregue
export const validadorDataEntrega = z
    .custom<unknown>(verificarDiaExistente, { message: "a data de entrega não existe no calendário" })
    .pipe(
        z.coerce.date().refine((dataEntrega) => dataEntrega <= new Date(), {
            message: "a data de entrega não pode ser futura",
        }),
    );

// RF02: produto comprado em texto livre, obrigatório (PRD seções 8 e 11 — não há catálogo de produtos)
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
    // ausente = mantém os marcos como estão; a edição só manda a lista quando ela existe na tela
    tiposMarcoIgnorados: z.array(z.number().int().positive()).optional(),
});