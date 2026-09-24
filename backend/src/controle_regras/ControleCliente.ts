import { Request, Response } from "express";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { validadorCadastroCliente, validadorEdicaoCliente } from "../validadores_entrada/ValidadorCliente";

// UC02 · Cadastrar cliente (RF02)
async function cadastrarCliente(req: Request, res: Response) {
  const dadosValidados = validadorCadastroCliente.parse(req.body);

  const novoCliente = await clientePrisma.cliente.create({
    data: {
      contato: dadosValidados.contato,
      endereco: dadosValidados.endereco,
      responsavelId: dadosValidados.responsavelId,
      pessoa: { create: { nome: dadosValidados.nome } },
      entregas: { create: { dataEntrega: dadosValidados.dataEntrega } },
    },
    include: { pessoa: true },
  });

  return res.status(201).json(novoCliente);
}

// UC03 · Editar cliente (RF09)
async function editarCliente(req: Request, res: Response) {
  const clienteId = Number(req.params.clienteId);
  if (Number.isNaN(clienteId)) {
    return res.status(400).json({ mensagem: "clienteId inválido" });
  }

  const { nome, ...dadosCliente } = validadorEdicaoCliente.parse(req.body);

  const clienteAtualizado = await clientePrisma.cliente.update({
    where: { id: clienteId },
    data: {
      ...dadosCliente,
      pessoa: nome ? { update: { nome } } : undefined,
    },
    include: { pessoa: true },
  });

  return res.json(clienteAtualizado);
}

export const controleCliente = { cadastrarCliente, editarCliente };