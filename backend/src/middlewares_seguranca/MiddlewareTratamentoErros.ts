import { Request, Response, NextFunction } from "express";

// captura erros não tratados nos controllers e evita que o servidor derrube
export function middlewareTratamentoErros(
  erro: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(erro);
  res.status(500).json({ mensagem: "erro interno do servidor" });
}
