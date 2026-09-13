import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// RNF03: um usuário não autenticado não acessa nenhuma tela ou dado de cliente
export function middlewareAutenticacao(req: Request, res: Response, next: NextFunction) {
  const cabecalhoAutorizacao = req.headers.authorization;

  if (!cabecalhoAutorizacao) {
    return res.status(401).json({ mensagem: "token não informado" });
  }

  const [, token] = cabecalhoAutorizacao.split(" ");

  try {
    const segredo = process.env.JWT_SEGREDO ?? "";
    const dadosToken = jwt.verify(token, segredo);
    req.atendenteLogado = dadosToken;
    next();
  } catch {
    return res.status(401).json({ mensagem: "token inválido ou expirado" });
  }
}
