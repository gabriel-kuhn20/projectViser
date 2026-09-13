import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { validadorCadastroAtendente } from "../validadores_entrada/ValidadorAtendente";

// UC10 · Cadastrar conta de atendente (RF10)
async function cadastrarAtendente(req: Request, res: Response) {
  const dadosValidados = validadorCadastroAtendente.parse(req.body);
  const senhaComHash = await bcrypt.hash(dadosValidados.senha, 10);

  const novoAtendente = await clientePrisma.atendente.create({
    data: { ...dadosValidados, senha: senhaComHash },
  });

  return res.status(201).json({ id: novoAtendente.id, nome: novoAtendente.nome });
}

export const controleAtendente = { cadastrarAtendente };
