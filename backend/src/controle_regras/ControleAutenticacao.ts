import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { ErroHttp } from "../middlewares_seguranca/ErroHttp";
import { atualizarSenhaUsuario } from "../regras_senha/AtualizacaoSenha";
import { criarEEnviarLinkRecuperacao, gerarHashToken } from "../regras_senha/LinkRecuperacao";
import { gerarTokenSessao, revogarTokenSessao } from "../regras_sessao/SessaoToken";
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

// Buscar conta pelo e-mail sem diferenciar maiúsculas
// o validador já converte o e-mail digitado para minúsculas, mas contas gravadas antes dessa
// regra podem ter maiúscula — o insensitive deixa essas pessoas entrarem sem corrigir o banco antes.
// Se sobrou um par que só difere na caixa, a conta mais antiga é a que vale
async function buscarUsuarioPorEmail(email: string) {
  return clientePrisma.usuario.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    orderBy: { id: "asc" },
  });
}

// UC01 · Entrar no sistema (RF01)
async function efetuarLogin(req: Request, res: Response) {
  const dadosValidados = validadorLogin.parse(req.body);

  const usuario = await buscarUsuarioPorEmail(dadosValidados.email);

  const senhaValida =
      usuario && (await bcrypt.compare(dadosValidados.senha, usuario.senha));

  if (!usuario || !senhaValida) {
    return res.status(401).json({ mensagem: "email ou senha inválidos" });
  }

  // a senha já foi conferida, então dizer que a conta está desativada não ajuda quem tenta adivinhar senhas
  if (!usuario.ativo) {
    return res.status(401).json({ mensagem: "conta desativada — fale com o administrador" });
  }

  return res.json({ token: gerarTokenSessao(usuario) });
}

// UC01 · Entrar no sistema (RF01): encerrar a sessão quando quiser
async function encerrarSessao(req: Request, res: Response) {
  const { jti, exp } = req.usuarioLogado!;

  // o middleware já recusa token sem `jti` e sem `exp`; a checagem existe para o TypeScript e para falhar alto
  if (!jti || !exp) throw new ErroHttp(401, "token inválido ou expirado");

  // só ESTE token é encerrado — a mesma conta aberta em outro aparelho continua logada
  await revogarTokenSessao(jti, exp);

  return res.status(204).send();
}

// UC12 · Recuperar senha (RF20)
async function solicitarRecuperacaoSenha(req: Request, res: Response) {
  const dadosValidados = validadorSolicitacaoRecuperacao.parse(req.body);

  const usuario = await buscarUsuarioPorEmail(dadosValidados.email);

  // conta inexistente e conta desativada param aqui, com a resposta de sempre e nenhum
  // e-mail: mandar o link para quem foi desativado devolveria o acesso que o
  // administrador acabou de tirar, e responder diferente revelaria qual é o caso
  const contaPodeRecuperar = usuario?.ativo === true;
  if (!contaPodeRecuperar) return res.json(RESPOSTA_SOLICITACAO_RECUPERACAO);

  await criarEEnviarLinkRecuperacao(usuario.id, dadosValidados.email);

  return res.json(RESPOSTA_SOLICITACAO_RECUPERACAO);
}

// UC12 · Recuperar senha (RF20): redefinir a senha pelo link recebido
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

  // a troca derrubou todas as sessões da conta, inclusive esta; devolve um token novo para quem
  // acabou de provar a senha atual não ser mandado de volta ao login
  // RNF: a senha não volta em nenhuma resposta da API, nem a que acabou de ser definida
  return res.json({ mensagem: "senha alterada", token: gerarTokenSessao(usuario) });
}

export const controleAutenticacao = {
  efetuarLogin,
  encerrarSessao,
  solicitarRecuperacaoSenha,
  redefinirSenha,
  trocarPropriaSenha,
};