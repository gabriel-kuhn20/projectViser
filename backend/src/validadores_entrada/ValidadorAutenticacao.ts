import { z } from "zod";

export const validadorLogin = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

// UC12 · Recuperar senha (RF20)
export const validadorSolicitacaoRecuperacao = z.object({
  email: z.string().email(),
});

// o mínimo de 8 é o mesmo do cadastro de conta — a recuperação não pode ser a porta
// para uma senha mais fraca do que a que o cadastro aceita
export const validadorRedefinicaoSenha = z
  .object({
    token: z.string().min(1),
    novaSenha: z.string().min(8),
    confirmacaoSenha: z.string().min(8),
  })
  // a conferência também vive aqui, e não só na tela: a tela pode ser contornada, a API não
  .refine((campos) => campos.novaSenha === campos.confirmacaoSenha, {
    message: "as senhas não conferem",
    path: ["confirmacaoSenha"],
  });
