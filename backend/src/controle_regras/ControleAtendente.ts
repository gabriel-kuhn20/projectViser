import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { PapelAcesso, Prisma } from "@prisma/client";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { ErroHttp } from "../middlewares_seguranca/ErroHttp";
import { criarEEnviarLinkRecuperacao } from "../regras_senha/LinkRecuperacao";
import {
  validadorCadastroAtendente,
  validadorEdicaoAtendente,
  validadorSituacaoAtendente,
} from "../validadores_entrada/ValidadorAtendente";
import { validadorParametroId } from "../validadores_entrada/ValidadorParametros";

// senha propositalmente de fora — nunca sai pela API, nem como hash
const camposPublicosAtendente = {
  id: true,
  email: true,
  papelAcesso: true,
  ativo: true,
  criadoEm: true,
  pessoa: { select: { nome: true } },
} satisfies Prisma.UsuarioSelect;

// Buscar conta existente por id
async function buscarAtendenteExistente(usuarioId: number) {
  const usuarioEncontrado = await clientePrisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuarioEncontrado) throw new ErroHttp(404, "usuário não encontrado");
  return usuarioEncontrado;
}

// Impedir que a conta saia do papel de administrador se for a última
// sem nenhum admin ninguém mais cadastra contas, exclui clientes ou gerencia tags (RF11);
// admin desativado não entra no sistema, então só os ativos contam
async function impedirRemocaoUltimoAdmin(usuarioAlvo: { papelAcesso: PapelAcesso; ativo: boolean }) {
  if (usuarioAlvo.papelAcesso !== "admin" || !usuarioAlvo.ativo) return;
  const totalAdmins = await clientePrisma.usuario.count({ where: { papelAcesso: "admin", ativo: true } });
  if (totalAdmins <= 1) {
    throw new ErroHttp(409, "o sistema precisa ter pelo menos um administrador");
  }
}

// Impedir e-mail repetido sem diferenciar maiúsculas
// o @unique do banco compara o texto exato: sozinho deixaria "ADMIN@..." conviver com "admin@..." gravado
// antes da conversão para minúsculas. Na edição a própria conta fica de fora, para manter o e-mail dela
async function impedirEmailRepetido(email: string, usuarioEditadoId?: number) {
  const contaComMesmoEmail = await clientePrisma.usuario.findFirst({
    where: { email: { equals: email, mode: "insensitive" }, id: { not: usuarioEditadoId } },
  });
  if (contaComMesmoEmail) throw new ErroHttp(409, "já existe uma conta com esse e-mail");
}

// UC10 · Cadastrar conta de atendente (RF09)
async function cadastrarAtendente(req: Request, res: Response) {
  const dadosValidados = validadorCadastroAtendente.parse(req.body);
  await impedirEmailRepetido(dadosValidados.email);
  const senhaComHash = await bcrypt.hash(dadosValidados.senha, 10);

  const novoUsuario = await clientePrisma.usuario.create({
    data: {
      email: dadosValidados.email,
      senha: senhaComHash,
      pessoa: { create: { nome: dadosValidados.nome } },
    },
    include: { pessoa: true },
  });

  return res.status(201).json({ id: novoUsuario.id, nome: novoUsuario.pessoa.nome });
}

// Listar contas de usuário
async function listarAtendentes(req: Request, res: Response) {
  const usuarios = await clientePrisma.usuario.findMany({
    select: camposPublicosAtendente,
    orderBy: { pessoa: { nome: "asc" } },
  });
  return res.json(usuarios);
}

// Buscar conta de usuário por id
async function buscarAtendentePorId(req: Request, res: Response) {
  const { id: usuarioId } = validadorParametroId.parse({ id: req.params.usuarioId });

  const usuario = await clientePrisma.usuario.findUnique({
    where: { id: usuarioId },
    select: camposPublicosAtendente,
  });
  if (!usuario) throw new ErroHttp(404, "usuário não encontrado");

  return res.json(usuario);
}

// Editar conta de usuário (nome, e-mail e papel — a senha fica fora desta rota)
async function editarAtendente(req: Request, res: Response) {
  const { id: usuarioId } = validadorParametroId.parse({ id: req.params.usuarioId });
  const { nome, email, papelAcesso } = validadorEdicaoAtendente.parse(req.body);

  const usuarioExistente = await buscarAtendenteExistente(usuarioId);
  const estaPerdendoAdmin = usuarioExistente.papelAcesso === "admin" && papelAcesso !== "admin";
  if (estaPerdendoAdmin) await impedirRemocaoUltimoAdmin(usuarioExistente);
  await impedirEmailRepetido(email, usuarioId);

  // dois pedidos com o mesmo e-mail ao mesmo tempo ainda caem no P2002 do Prisma, que vira 409
  const usuarioAtualizado = await clientePrisma.usuario.update({
    where: { id: usuarioId },
    data: { email, papelAcesso, pessoa: { update: { nome } } },
    select: camposPublicosAtendente,
  });

  return res.json(usuarioAtualizado);
}

// Excluir conta de usuário
// bloqueada se houver interações — o histórico do cliente (UC06) perderia quem fez cada contato;
// clientes que a conta GERENCIA ficam sem responsável e a pessoa só é apagada se não for também cliente
async function excluirAtendente(req: Request, res: Response) {
  const { id: usuarioId } = validadorParametroId.parse({ id: req.params.usuarioId });

  const ehPropriaConta = req.usuarioLogado!.usuarioId === usuarioId;
  if (ehPropriaConta) throw new ErroHttp(409, "não é possível excluir a própria conta");

  const usuarioExistente = await buscarAtendenteExistente(usuarioId);
  await impedirRemocaoUltimoAdmin(usuarioExistente);

  const totalInteracoes = await clientePrisma.interacao.count({ where: { usuarioId } });
  if (totalInteracoes > 0) {
    throw new ErroHttp(409, "usuário tem interações registradas no histórico e não pode ser excluído");
  }

  await clientePrisma.$transaction(async (transacao) => {
    await transacao.emAtendimento.deleteMany({ where: { usuarioId } });
    // os links de recuperação em aberto apontam para o usuário e a FK é ON DELETE RESTRICT:
    // sem apagar antes, excluir quem já pediu redefinição falha com "registros vinculados"
    await transacao.tokenRecuperacaoSenha.deleteMany({ where: { usuarioId } });
    await transacao.usuario.delete({ where: { id: usuarioId } });

    const totalClientesDaPessoa = await transacao.cliente.count({ where: { pessoaId: usuarioExistente.pessoaId } });
    if (totalClientesDaPessoa === 0) {
      await transacao.pessoa.delete({ where: { id: usuarioExistente.pessoaId } });
    }
  });

  return res.json({ mensagem: "usuário excluído" });
}

// Desativar ou reativar conta de usuário (só administrador, RF11)
// alternativa à exclusão para quem já tem interações: a conta perde o acesso, o histórico fica
async function alterarSituacaoAtendente(req: Request, res: Response) {
  const { id: usuarioId } = validadorParametroId.parse({ id: req.params.usuarioId });
  const { ativo } = validadorSituacaoAtendente.parse(req.body);

  const ehPropriaConta = req.usuarioLogado!.usuarioId === usuarioId;
  if (!ativo && ehPropriaConta) throw new ErroHttp(409, "não é possível desativar a própria conta");

  const usuarioExistente = await buscarAtendenteExistente(usuarioId);
  if (!ativo) await impedirRemocaoUltimoAdmin(usuarioExistente);

  const usuarioAtualizado = await clientePrisma.$transaction(async (transacao) => {
    // quem sai não volta para concluir o contato — o lembrete que estava "em atendimento" com ele é liberado
    if (!ativo) await transacao.emAtendimento.deleteMany({ where: { usuarioId } });

    return transacao.usuario.update({
      where: { id: usuarioId },
      data: { ativo },
      select: camposPublicosAtendente,
    });
  });

  return res.json(usuarioAtualizado);
}

// UC14 · Enviar à pessoa o link para criar uma senha nova (RF22)
async function enviarLinkRecuperacaoAtendente(req: Request, res: Response) {
  const { id: usuarioId } = validadorParametroId.parse({ id: req.params.usuarioId });

  const usuarioEncontrado = await buscarAtendenteExistente(usuarioId);

  // conta desativada não recebe link: o acesso foi tirado de propósito e o link o devolveria.
  // Aqui o erro é explícito, ao contrário da tela pública — quem pede é o próprio administrador
  if (!usuarioEncontrado.ativo) {
    throw new ErroHttp(409, "conta desativada — reative antes de enviar o link");
  }

  // o administrador destrava a pessoa, mas NÃO escolhe a senha dela: o link vai para o
  // e-mail da conta e quem define a senha é a própria dona. Se o admin definisse a senha,
  // passaria a poder entrar como ela — e o histórico registra quem atendeu cada cliente
  await criarEEnviarLinkRecuperacao(usuarioEncontrado.id, usuarioEncontrado.email);

  return res.json({ mensagem: `link de redefinição enviado para ${usuarioEncontrado.email}` });
}

export const controleAtendente = {
  cadastrarAtendente,
  listarAtendentes,
  buscarAtendentePorId,
  editarAtendente,
  excluirAtendente,
  alterarSituacaoAtendente,
  enviarLinkRecuperacaoAtendente,
};