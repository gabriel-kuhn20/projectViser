import crypto from "node:crypto";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { obterSegredoJwt, obterUrlFrontend } from "../config_servidor/ConfiguracaoAmbiente";
import { ErroHttp } from "../middlewares_seguranca/ErroHttp";
import { enviarEmailRecuperacaoSenha } from "../servicos_email/EnviadorEmail";
import {
  validadorLogin,
  validadorRedefinicaoSenha,
  validadorSolicitacaoRecuperacao,
} from "../validadores_entrada/ValidadorAutenticacao";

// UC12 · Recuperar senha (RF20)
// 30 minutos: curto o bastante para um link vazado perder valor rápido, longo o
// bastante para a pessoa achar o e-mail e trocar a senha sem o link morrer no meio
const MINUTOS_VALIDADE_RECUPERACAO = 30;

// a mesma resposta para e-mail cadastrado e não cadastrado — responder diferente
// entregaria, para quem só quer descobrir isso, quais e-mails existem no sistema
const RESPOSTA_SOLICITACAO_RECUPERACAO = {
  mensagem: "se o e-mail estiver cadastrado, o link de redefinição chega em instantes",
};

// link inexistente, vencido e já usado dão a mesma mensagem: os três pedem a mesma
// ação da pessoa, e separar as mensagens só ajudaria quem está testando tokens
const MENSAGEM_LINK_INVALIDO = "link inválido ou expirado — solicite a redefinição de novo";

// UC01 · Entrar no sistema (RF01)
async function efetuarLogin(req: Request, res: Response) {
  const dadosValidados = validadorLogin.parse(req.body);

  const usuario = await clientePrisma.usuario.findUnique({
    where: { email: dadosValidados.email },
  });

  const senhaValida =
      usuario && (await bcrypt.compare(dadosValidados.senha, usuario.senha));

  if (!usuario || !senhaValida) {
    return res.status(401).json({ mensagem: "email ou senha inválidos" });
  }

  // a senha já foi conferida, então dizer que a conta está desativada não ajuda quem tenta adivinhar senhas
  if (!usuario.ativo) {
    return res.status(401).json({ mensagem: "conta desativada — fale com o administrador" });
  }

 const token = jwt.sign(
  { usuarioId: usuario.id, papelAcesso: usuario.papelAcesso },
  obterSegredoJwt(),
  { expiresIn: "8h" }
);

  return res.json({ token });
}

// Gerar o hash que representa o token no banco
// o banco nunca vê o token puro: aqui para gravar, na redefinição para procurar
function gerarHashToken(tokenPuro: string) {
  return crypto.createHash("sha256").update(tokenPuro).digest("hex");
}

// Gerar o token que vai no link do e-mail, junto do hash correspondente
function gerarTokenRecuperacao() {
  // 32 bytes de aleatoriedade criptográfica — o equivalente do SecureRandom do Java
  const tokenPuro = crypto.randomBytes(32).toString("hex");
  return { tokenPuro, tokenHash: gerarHashToken(tokenPuro) };
}

// UC12 · Recuperar senha (RF20)
async function solicitarRecuperacaoSenha(req: Request, res: Response) {
  const dadosValidados = validadorSolicitacaoRecuperacao.parse(req.body);

  const usuario = await clientePrisma.usuario.findUnique({
    where: { email: dadosValidados.email },
    select: { id: true },
  });

  // sem conta cadastrada o fluxo termina aqui: a resposta de sempre e nenhum e-mail
  if (!usuario) return res.json(RESPOSTA_SOLICITACAO_RECUPERACAO);

  const { tokenPuro, tokenHash } = gerarTokenRecuperacao();

  await clientePrisma.tokenRecuperacaoSenha.create({
    data: {
      usuarioId: usuario.id,
      tokenHash,
      expiraEm: new Date(Date.now() + MINUTOS_VALIDADE_RECUPERACAO * 60 * 1000),
    },
  });

  // o token puro existe só nesta função e no e-mail de quem pediu
  const linkRecuperacao = `${obterUrlFrontend()}/redefinir-senha?token=${tokenPuro}`;
  await enviarEmailRecuperacaoSenha(dadosValidados.email, linkRecuperacao, MINUTOS_VALIDADE_RECUPERACAO);

  return res.json(RESPOSTA_SOLICITACAO_RECUPERACAO);
}

// UC12 · Redefinir a senha pelo link recebido (RF20)
async function redefinirSenha(req: Request, res: Response) {
  const dadosValidados = validadorRedefinicaoSenha.parse(req.body);

  const tokenEncontrado = await clientePrisma.tokenRecuperacaoSenha.findUnique({
    where: { tokenHash: gerarHashToken(dadosValidados.token) },
  });

  // UC12 · A1: link que não existe, já venceu ou já foi usado — a pessoa pede outro
  if (!tokenEncontrado) throw new ErroHttp(400, MENSAGEM_LINK_INVALIDO);

  const tokenJaUsado = tokenEncontrado.usadoEm !== null;
  const tokenVencido = tokenEncontrado.expiraEm <= new Date();
  if (tokenJaUsado || tokenVencido) throw new ErroHttp(400, MENSAGEM_LINK_INVALIDO);

  const senhaComHash = await bcrypt.hash(dadosValidados.novaSenha, 10);

  // transação: gravar a senha nova e queimar o token valem juntos ou nenhum dos dois —
  // um token que sobrevivesse à troca continuaria abrindo a conta
  await clientePrisma.$transaction([
    clientePrisma.usuario.update({
      where: { id: tokenEncontrado.usuarioId },
      data: { senha: senhaComHash },
    }),
    // queima o token usado e, no mesmo passe, os outros links em aberto da conta:
    // depois da troca, nenhum link antigo na caixa de entrada deve continuar valendo
    clientePrisma.tokenRecuperacaoSenha.updateMany({
      where: { usuarioId: tokenEncontrado.usuarioId, usadoEm: null },
      data: { usadoEm: new Date() },
    }),
  ]);

  return res.json({ mensagem: "senha redefinida — entre com a senha nova" });
}

export const controleAutenticacao = { efetuarLogin, solicitarRecuperacaoSenha, redefinirSenha };