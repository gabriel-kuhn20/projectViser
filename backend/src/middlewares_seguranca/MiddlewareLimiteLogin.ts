import rateLimit from "express-rate-limit";

const MINUTOS_JANELA_LOGIN = 15;
const MAXIMO_TENTATIVAS_LOGIN = 10;

// RNF09: limita tentativas de senha por IP (10 em 15 minutos); nos testes BDD fica desligado porque todos os cenários
// entram do mesmo IP e estourariam o limite
export const middlewareLimiteLogin = rateLimit({
  windowMs: MINUTOS_JANELA_LOGIN * 60 * 1000,
  limit: MAXIMO_TENTATIVAS_LOGIN,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: { mensagem: `muitas tentativas de login — tente de novo em ${MINUTOS_JANELA_LOGIN} minutos` },
});