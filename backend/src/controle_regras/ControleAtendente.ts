import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { validadorCadastroAtendente } from "../validadores_entrada/ValidadorAtendente";

// UC10 · Cadastrar conta de atendente (RF10)
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

export const controleAtendente = { cadastrarAtendente };