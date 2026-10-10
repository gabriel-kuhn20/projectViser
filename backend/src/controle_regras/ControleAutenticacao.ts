import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { obterSegredoJwt } from "../config_servidor/ConfiguracaoAmbiente";
import { validadorLogin } from "../validadores_entrada/ValidadorAutenticacao";

// hash descartável: quando o email não existe, a comparação roda contra ele, para o
// tempo de resposta não revelar quais emails estão cadastrados
const hashFicticio = bcrypt.hashSync("senha-ficticia", 10);

// UC01 · Entrar no sistema (RF01)
async function efetuarLogin(req: Request, res: Response) {
  const dadosValidados = validadorLogin.parse(req.body);

  const usuario = await clientePrisma.usuario.findUnique({
    where: { email: dadosValidados.email },
  });

  const senhaValida = await bcrypt.compare(dadosValidados.senha, usuario?.senha ?? hashFicticio);

  if (!usuario || !senhaValida) {
    return res.status(401).json({ mensagem: "email ou senha inválidos" });
  }

  const token = jwt.sign(
    { usuarioId: usuario.id, papelAcesso: usuario.papelAcesso },
    obterSegredoJwt(),
    { algorithm: "HS256", expiresIn: "8h" }
  );

  return res.json({ token });
}

export const controleAutenticacao = { efetuarLogin };