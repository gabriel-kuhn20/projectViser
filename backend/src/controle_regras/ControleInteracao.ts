import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { ErroHttp } from "../middlewares_seguranca/ErroHttp";
import {
  validadorEdicaoInteracao,
  validadorRegistroInteracao,
  validadorRespostaInteracao,
} from "../validadores_entrada/ValidadorInteracao";
import { validadorParametroId } from "../validadores_entrada/ValidadorParametros";
import { buscarLembretePendente } from "./ControleLembrete";

// mesmo recorte no histórico e no detalhe — e-mail e senha do usuário ficam propositalmente de fora
const relacoesPublicasInteracao = {
  usuario: { select: { id: true, pessoa: { select: { nome: true } } } },
  lembrete: {
    select: { id: true, status: true, marco: { select: { tipoMarco: { select: { nome: true } } } } },
  },
} satisfies Prisma.InteracaoInclude;

// Verificar se o usuário do token ainda existe
// o JWT continua válido até expirar MESMO se o usuário for removido do banco
async function verificarUsuarioExistente(usuarioId: number) {
  const usuarioEncontrado = await clientePrisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuarioEncontrado) throw new ErroHttp(401, "usuário do token não existe mais");
}

// Buscar interação por id junto com o status do lembrete
// a exclusão depende do status, por isso ele já vem nesta busca
async function buscarInteracaoExistente(interacaoId: number) {
  const interacaoEncontrada = await clientePrisma.interacao.findUnique({
    where: { id: interacaoId },
    include: { lembrete: { select: { status: true } } },
  });
  if (!interacaoEncontrada) throw new ErroHttp(404, "interação não encontrada");
  return interacaoEncontrada;
}

// Verificar se quem altera é o autor da interação ou um admin
// o histórico é registro de quem atendeu — outro atendente não pode reescrever
function verificarAutorOuAdmin(req: Request, autorId: number) {
  const { usuarioId, papelAcesso } = req.usuarioLogado!;
  const podeAlterarInteracao = papelAcesso === "admin" || usuarioId === autorId;
  if (!podeAlterarInteracao) {
    throw new ErroHttp(403, "só quem registrou a interação ou um admin pode alterá-la");
  }
}

// UC06 · Consultar histórico do cliente (RF06)
async function listarHistoricoCliente(req: Request, res: Response) {
  const { id: clienteId } = validadorParametroId.parse({ id: req.params.clienteId });

  const interacoes = await clientePrisma.interacao.findMany({
    where: { lembrete: { marco: { entrega: { clienteId } } } },
    include: relacoesPublicasInteracao,
    orderBy: { criadoEm: "desc" },
  });

  return res.json(interacoes);
}

// UC06 · Consultar histórico do cliente (RF06)
async function buscarInteracaoPorId(req: Request, res: Response) {
  const { id: interacaoId } = validadorParametroId.parse({ id: req.params.interacaoId });

  const interacao = await clientePrisma.interacao.findUnique({
    where: { id: interacaoId },
    include: relacoesPublicasInteracao,
  });
  if (!interacao) throw new ErroHttp(404, "interação não encontrada");

  return res.json(interacao);
}

// UC07 · Registrar interação (RF05)
async function registrarInteracao(req: Request, res: Response) {
  const dadosValidados = validadorRegistroInteracao.parse(req.body);
  const usuarioId = req.usuarioLogado!.usuarioId;
  await verificarUsuarioExistente(usuarioId);
  // interação em lembrete concluído ficaria fora do contato que já foi encerrado
  await buscarLembretePendente(dadosValidados.lembreteId);

  const novaInteracao = await clientePrisma.interacao.create({
    data: { ...dadosValidados, usuarioId },
  });

  return res.status(201).json(novaInteracao);
}

// UC07 · Registrar interação (RF05): corrigir o texto de uma tentativa
// só enquanto o lembrete está pendente — depois de concluído o histórico é o registro do atendimento
// e não muda; editadoEm deixa claro na tela que o texto foi alterado
async function editarInteracao(req: Request, res: Response) {
  const { id: interacaoId } = validadorParametroId.parse({ id: req.params.interacaoId });
  const { conteudo, respostaCliente } = validadorEdicaoInteracao.parse(req.body);

  const interacaoExistente = await buscarInteracaoExistente(interacaoId);
  verificarAutorOuAdmin(req, interacaoExistente.usuarioId);
  const jaFoiConcluida = interacaoExistente.lembrete.status !== "pendente";
  if (jaFoiConcluida) {
    throw new ErroHttp(409, "não é possível editar interação de lembrete já concluído");
  }

  const interacaoEditada = await clientePrisma.interacao.update({
    where: { id: interacaoId },
    data: { conteudo, respostaCliente: respostaCliente || null, editadoEm: new Date() },
    include: relacoesPublicasInteracao,
  });

  return res.json(interacaoEditada);
}

// UC07 · Registrar interação (RF05)
// a resposta do cliente pode chegar depois do contato — por isso não exige lembrete pendente
async function registrarRespostaCliente(req: Request, res: Response) {
  const { id: interacaoId } = validadorParametroId.parse({ id: req.params.interacaoId });
  const { respostaCliente } = validadorRespostaInteracao.parse(req.body);

  const interacaoExistente = await buscarInteracaoExistente(interacaoId);
  verificarAutorOuAdmin(req, interacaoExistente.usuarioId);

  const interacaoAtualizada = await clientePrisma.interacao.update({
    where: { id: interacaoId },
    data: { respostaCliente },
  });

  return res.json(interacaoAtualizada);
}

// Excluir interação
// só com lembrete pendente — o UC08 exige ao menos uma interação para concluir, e apagar
// depois deixaria um lembrete concluído sem o registro que justificou a conclusão
async function excluirInteracao(req: Request, res: Response) {
  const { id: interacaoId } = validadorParametroId.parse({ id: req.params.interacaoId });

  const interacaoExistente = await buscarInteracaoExistente(interacaoId);
  verificarAutorOuAdmin(req, interacaoExistente.usuarioId);
  const jaFoiConcluida = interacaoExistente.lembrete.status !== "pendente";
  if (jaFoiConcluida) {
    throw new ErroHttp(409, "não é possível excluir interação de lembrete já concluído");
  }

  await clientePrisma.interacao.delete({ where: { id: interacaoId } });

  return res.json({ mensagem: "interação excluída" });
}

export const controleInteracao = {
  listarHistoricoCliente,
  buscarInteracaoPorId,
  registrarInteracao,
  registrarRespostaCliente,
  editarInteracao,
  excluirInteracao,
};