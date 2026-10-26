import { z } from "zod";

// até 10 anos: marcos mais longos que isso não fazem sentido no pós-venda de óculos
const validadorDiasAposEntrega = z
    .number({ invalid_type_error: "informe os dias em número" })
    .int("informe um número inteiro de dias")
    .min(1, "o marco precisa ser de pelo menos 1 dia")
    .max(3650, "o marco pode ser de no máximo 3650 dias");

const validadorNomeMarco = z.string().trim().min(1, "não pode ficar em branco").max(40, "use até 40 caracteres");

export const validadorCadastroTipoMarco = z.object({
    nome: validadorNomeMarco,
    diasAposEntrega: validadorDiasAposEntrega,
});

export const validadorEdicaoTipoMarco = z.object({
    nome: validadorNomeMarco.optional(),
    diasAposEntrega: validadorDiasAposEntrega.optional(),
    ativo: z.boolean().optional(),
});
