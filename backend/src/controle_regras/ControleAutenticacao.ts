import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { obterSegredoJwt } from "../config_servidor/ConfiguracaoAmbiente";
import { ErroHttp } from "../middlewares_seguranca/ErroHttp";
import { atualizarSenhaUsuario } from "../regras_senha/AtualizacaoSenha";
import { criarEEnviarLinkRecuperacao, gerarHashToken } from "../regras_senha/LinkRecuperacao";
import {
  validadorLogin,
  validadorRedefinicaoSenha,
  validadorSolicitacaoRecuperacao,
  validadorTrocaSenha,
} from "../validadores_entrada/ValidadorAutenticacao";

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

 const token = jwt.sign(
  { usuarioId: usuario.id, papelAcesso: usuario.papelAcesso },
  obterSegredoJwt(),
  { expiresIn: "8h" }
);

  return res.json({ token });
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

  await criarEEnviarLinkRecuperacao(usuario.id, dadosValidados.email);

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

  // queima o token usado e os outros links em aberto da conta, junto com a senha nova
  await atualizarSenhaUsuario(tokenEncontrado.usuarioId, dadosValidados.novaSenha);

  return res.json({ mensagem: "senha redefinida — entre com a senha nova" });
}

// UC13 · Trocar a própria senha (RF21)
async function trocarPropriaSenha(req: Request, res: Response) {
  const dadosValidados = validadorTrocaSenha.parse(req.body);
  const { usuarioId } = req.usuarioLogado!;

  const usuario = await clientePrisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) throw new ErroHttp(401, "usuário do token não existe mais");

  // sem conferir a senha atual, quem encontrasse a tela aberta de alguém trocaria a
  // senha e tomaria a conta — o token sozinho não prova que é a pessoa na frente da tela
  const senhaAtualConfere = await bcrypt.compare(dadosValidados.senhaAtual, usuario.senha);
  if (!senhaAtualConfere) throw new ErroHttp(400, "senha atual incorreta");

  const repetiuASenha = await bcrypt.compare(dadosValidados.novaSenha, usuario.senha);
  if (repetiuASenha) throw new ErroHttp(400, "a nova senha precisa ser diferente da atual");

  await atualizarSenhaUsuario(usuarioId, dadosValidados.novaSenha);

  // RNF: a senha não volta em nenhuma resposta da API, nem a que acabou de ser definida
  return res.json({ mensagem: "senha alterada" });
}

export const controleAutenticacao = {
  efetuarLogin,
  solicitarRecuperacaoSenha,
  redefinirSenha,
  trocarPropriaSenha,
};