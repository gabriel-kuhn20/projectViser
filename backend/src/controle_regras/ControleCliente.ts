import { Request, Response } from "express";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { validadorCadastroCliente, validadorEdicaoCliente } from "../validadores_entrada/ValidadorCliente";

// UC02 · Cadastrar cliente (RF02)
async function cadastrarCliente(req: Request, res: Response) {
  const dadosValidados = validadorCadastroCliente.parse(req.body);

  const novoCliente = await clientePrisma.cliente.create({
    data: {
      nome: dadosValidados.nome,
      contato: dadosValidados.contato,
      atendenteId: dadosValidados.atendenteId,
      entregas: { create: { dataEntrega: dadosValidados.dataEntrega } },
    },
  });

  return res.status(201).json(novoCliente);
}

// UC03 · Editar cliente (RF09)
async function editarCliente(req: Request, res: Response) {
  const { clienteId } = req.params;
  const dadosValidados = validadorEdicaoCliente.parse(req.body);

  const clienteAtualizado = await clientePrisma.cliente.update({
    where: { id: clienteId },
    data: dadosValidados,
  });

  return res.json(clienteAtualizado);
}

export const controleCliente = { cadastrarCliente, editarCliente };
