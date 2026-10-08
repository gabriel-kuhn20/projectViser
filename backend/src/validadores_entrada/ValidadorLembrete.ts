import { z } from "zod";

// tipos de marco aceitos na URL — os mesmos nomes cadastrados pelo seed na tabela tipo_marco
export const validadorParametroTipoMarco = z.object({
    tipoMarco: z.enum(["7d", "2m", "1a"]),
});