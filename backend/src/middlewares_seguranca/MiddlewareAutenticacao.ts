import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PapelAcesso } from "@prisma/client";
import { obterSegredoJwt } from "../config_servidor/ConfiguracaoAmbiente";

// RNF03: usuário não autenticado não acessa dados de cliente
export function middlewareAutenticacao(req: Request, res: Response, next: NextFunction) {
  const cabecalhoAutorizacao = req.headers.authorization;

  if (!cabecalhoAutorizacao) {
    return res.status(401).json({ mensagem: "token não informado" });
  }

  const [esquema, token] = cabecalhoAutorizacao.split(" ");
  if (esquema !== "Bearer" || !token) {
    return res.status(401).json({ mensagem: "formato do token inválido" });
  }

  // fora do try: segredo ausente é erro de configuração (500), não token inválido
  const segredoJwt = obterSegredoJwt();

  try {
    // algorithms fixo: impede que um token assinado com outro algoritmo seja aceito
    req.usuarioLogado = jwt.verify(token, segredoJwt, { algorithms: ["HS256"] }) as {
      usuarioId: number;
      papelAcesso: PapelAcesso;
    };
    next();
  } catch {
    return res.status(401).json({ mensagem: "token inválido ou expirado" });
  }
}