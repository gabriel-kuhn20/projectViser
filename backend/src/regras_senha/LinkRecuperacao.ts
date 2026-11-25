// Centraliza a criação do link de recuperação: gera o token, grava só o hash e manda o
// e-mail. Dois caminhos chegam aqui — a pessoa pedindo pela tela de login, e o
// administrador destravando alguém pela tela de atendentes.
import crypto from "node:crypto";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { obterUrlFrontend } from "../config_servidor/ConfiguracaoAmbiente";
import { enviarEmailRecuperacaoSenha } from "../servicos_email/EnviadorEmail";

// 30 minutos: curto o bastante para um link vazado perder valor rápido, longo o
// bastante para a pessoa achar o e-mail e trocar a senha sem o link morrer no meio
const MINUTOS_VALIDADE_RECUPERACAO = 30;

// Gerar o hash que representa o token no banco
// o banco nunca vê o token puro: aqui para gravar, na redefinição para procurar
export function gerarHashToken(tokenPuro: string) {
  return crypto.createHash("sha256").update(tokenPuro).digest("hex");
}

// UC12 · Recuperar senha (RF20, RNF11)
export async function criarEEnviarLinkRecuperacao(usuarioId: number, email: string) {
  // 32 bytes de aleatoriedade criptográfica — o equivalente do SecureRandom do Java
  const tokenPuro = crypto.randomBytes(32).toString("hex");

  await clientePrisma.tokenRecuperacaoSenha.create({
    data: {
      usuarioId,
      tokenHash: gerarHashToken(tokenPuro),
      expiraEm: new Date(Date.now() + MINUTOS_VALIDADE_RECUPERACAO * 60 * 1000),
    },
  });

  // o token puro existe só nesta função e no e-mail de quem recebe
  const linkRecuperacao = `${obterUrlFrontend()}/redefinir-senha?token=${tokenPuro}`;
  await enviarEmailRecuperacaoSenha(email, linkRecuperacao, MINUTOS_VALIDADE_RECUPERACAO);
}
