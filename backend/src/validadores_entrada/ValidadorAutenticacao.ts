import { z } from "zod";

export const validadorLogin = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});
