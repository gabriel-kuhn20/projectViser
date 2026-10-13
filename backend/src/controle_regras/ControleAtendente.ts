import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { PapelAcesso, Prisma } from "@prisma/client";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { ErroHttp } from "../middlewares_seguranca/ErroHttp";
import { validadorCadastroAtendente, validadorEdicaoAtendente } from "../validadores_entrada/ValidadorAtendente";
import { validadorParametroId } from "../validadores_entrada/ValidadorParametros";

// senha propositalmente de fora — nunca sai pela API, nem como hash
const camposPublicosAtendente = {
  id: true,
  email: true,
  papelAcesso: true,
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
// sem nenhum admin ninguém mais cadastra contas, exclui clientes ou gerencia tags (RF11)
async function impedirRemocaoUltimoAdmin(papelAtual: PapelAcesso) {
  if (papelAtual !== "admin") return;
  const totalAdmins = await clientePrisma.usuario.count({ where: { papelAcesso: "admin" } });
  if (totalAdmins <= 1) {
    throw new ErroHttp(409, "o sistema precisa ter pelo menos um administrador");
  }
}

// UC10 · Cadastrar conta de atendente (RF09)
async function cadastrarAtendente(req: Request, res: Response) {
  const dadosValidados = validadorCadastroAtendente.parse(req.body);
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
  if (estaPerdendoAdmin) await impedirRemocaoUltimoAdmin(usuarioExistente.papelAcesso);

  // e-mail repetido cai no P2002 do Prisma e o middleware de erros responde 409
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
  await impedirRemocaoUltimoAdmin(usuarioExistente.papelAcesso);

  const totalInteracoes = await clientePrisma.interacao.count({ where: { usuarioId } });
  if (totalInteracoes > 0) {
    throw new ErroHttp(409, "usuário tem interações registradas no histórico e não pode ser excluído");
  }

  await clientePrisma.$transaction(async (transacao) => {
    await transacao.cliente.updateMany({ where: { responsavelId: usuarioId }, data: { responsavelId: null } });
    await transacao.emAtendimento.deleteMany({ where: { usuarioId } });
    await transacao.usuario.delete({ where: { id: usuarioId } });

    const totalClientesDaPessoa = await transacao.cliente.count({ where: { pessoaId: usuarioExistente.pessoaId } });
    if (totalClientesDaPessoa === 0) {
      await transacao.pessoa.delete({ where: { id: usuarioExistente.pessoaId } });
    }
  });

  return res.json({ mensagem: "usuário excluído" });
}

export const controleAtendente = {
  cadastrarAtendente,
  listarAtendentes,
  buscarAtendentePorId,
  editarAtendente,
  excluirAtendente,
};