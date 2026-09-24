import { Request, Response } from "express";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { validadorRegistroInteracao } from "../validadores_entrada/ValidadorInteracao";

// UC06 · Consultar histórico do cliente (RF06)
async function listarHistoricoCliente(req: Request, res: Response) {
  const clienteId = Number(req.params.clienteId);
  if (Number.isNaN(clienteId)) {
    return res.status(400).json({ mensagem: "clienteId inválido" });
  }

  const interacoes = await clientePrisma.interacao.findMany({
    where: { lembrete: { marco: { entrega: { clienteId } } } },
    orderBy: { criadoEm: "desc" },
  });

  return res.json(interacoes);
}

// UC07 · Registrar interação (RF05)
async function registrarInteracao(req: Request, res: Response) {
  const dadosValidados = validadorRegistroInteracao.parse(req.body);
  const usuarioId = (req as any).usuarioLogado.usuarioId;

  const novaInteracao = await clientePrisma.interacao.create({
    data: { ...dadosValidados, usuarioId },
  });

  return res.status(201).json(novaInteracao);
}

export const controleInteracao = { listarHistoricoCliente, registrarInteracao };