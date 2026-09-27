import { Request, Response } from "express";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { validadorCadastroCliente, validadorEdicaoCliente } from "../validadores_entrada/ValidadorCliente";
import { validadorParametroId } from "../validadores_entrada/ValidadorParametros";

// UC02 · Cadastrar cliente (RF02)
async function cadastrarCliente(req: Request, res: Response) {
  const dadosValidados = validadorCadastroCliente.parse(req.body);

  const novoCliente = await clientePrisma.cliente.create({
    data: {
      contato: dadosValidados.contato,
      endereco: dadosValidados.endereco,
      responsavel: dadosValidados.responsavelId
        ? { connect: { id: dadosValidados.responsavelId } }
        : undefined,
      pessoa: { create: { nome: dadosValidados.nome } },
      entregas: { create: { dataEntrega: dadosValidados.dataEntrega } },
    },
    include: { pessoa: true },
  });

  return res.status(201).json(novoCliente);
}

// UC03 · Editar cliente (RF09)
async function editarCliente(req: Request, res: Response) {
  const { id: clienteId } = validadorParametroId.parse({ id: req.params.clienteId });
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