import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { validadorLogin } from "../validadores_entrada/ValidadorAutenticacao";

// UC01 · Entrar no sistema (RF01)
async function efetuarLogin(req: Request, res: Response) {
  const dadosValidados = validadorLogin.parse(req.body);

  const usuario = await clientePrisma.usuario.findUnique({
    where: { email: dadosValidados.email },
  });

  const senhaValida =
    usuario && (await bcrypt.compare(dadosValidados.senha, usuario.senha));

  if (!usuario || !senhaValida) {
    return res.status(401).json({ mensagem: "email ou senha inválidos" });
  }

  const segredo = process.env.JWT_SEGREDO ?? "";
  const token = jwt.sign({ usuarioId: usuario.id }, segredo, { expiresIn: "8h" });

  return res.json({ token });
}

export const controleAutenticacao = { efetuarLogin };