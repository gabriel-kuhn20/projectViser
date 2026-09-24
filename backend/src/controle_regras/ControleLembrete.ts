import { Request, Response } from "express";
import { clientePrisma } from "../config_servidor/ClientePrisma";

// UC05 · Ver lista de lembretes por marco (RF04)
async function listarPorMarco(req: Request, res: Response) {
  const { tipoMarco } = req.params;

  const lembretesPendentes = await clientePrisma.lembrete.findMany({
    where: { status: "pendente", marco: { tipoMarco: { nome: tipoMarco } } },
    include: { marco: { include: { entrega: { include: { cliente: true } } } }, emAtendimentos: true },
  });

  return res.json(lembretesPendentes);
}

// UC08 · Concluir lembrete de contato (RF07)
// A1: bloqueia a conclusão se não houver interação registrada
async function concluirLembrete(req: Request, res: Response) {
  const lembreteId = Number(req.params.lembreteId);
  if (Number.isNaN(lembreteId)) {
    return res.status(400).json({ mensagem: "lembreteId inválido" });
  }

  const totalInteracoes = await clientePrisma.interacao.count({ where: { lembreteId } });
  if (totalInteracoes === 0) {
    return res.status(400).json({ mensagem: "registre uma interação antes de concluir o lembrete" });
  }

  const lembreteConcluido = await clientePrisma.$transaction(async (transacao) => {
    await transacao.emAtendimento.deleteMany({ where: { lembreteId } });
    return transacao.lembrete.update({
      where: { id: lembreteId },
      data: { status: "concluido", concluidoEm: new Date() },
    });
  });

  return res.json(lembreteConcluido);
}

// UC09 · Marcar lembrete como em atendimento (RF08)
// A1: outro atendente já tratando aquele lembrete não pode assumir de novo
async function marcarEmAtendimento(req: Request, res: Response) {
  const lembreteId = Number(req.params.lembreteId);
  if (Number.isNaN(lembreteId)) {
    return res.status(400).json({ mensagem: "lembreteId inválido" });
  }
  const usuarioId = (req as any).usuarioLogado.usuarioId;

  const jaEmAtendimento = await clientePrisma.emAtendimento.findUnique({ where: { lembreteId } });
  if (jaEmAtendimento) {
    return res.status(409).json({ mensagem: "lembrete já está sendo tratado por outro atendente" });
  }

  const registro = await clientePrisma.emAtendimento.create({ data: { lembreteId, usuarioId } });
  return res.status(201).json(registro);
}

// UC09 · A2: desistir do contato libera o lembrete manualmente
async function desmarcarEmAtendimento(req: Request, res: Response) {
  const lembreteId = Number(req.params.lembreteId);
  if (Number.isNaN(lembreteId)) {
    return res.status(400).json({ mensagem: "lembreteId inválido" });
  }
  await clientePrisma.emAtendimento.delete({ where: { lembreteId } });
  return res.status(204).send();
}

export const controleLembrete = {
  listarPorMarco,
  concluirLembrete,
  marcarEmAtendimento,
  desmarcarEmAtendimento,
};