import { z } from "zod";

// Schema reutilizável para validar parâmetros de rota que representam
// um id numérico (ex: :clienteId, :lembreteId). Uso:
// const { id } = validadorParametroId.parse({ id: req.params.clienteId });
export const validadorParametroId = z.object({
  id: z.coerce.number().int().positive(),
});