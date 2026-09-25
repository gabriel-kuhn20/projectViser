import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ErroHttp } from "./ErroHttp";

// Centraliza toda resposta de erro da API — nenhum controller monta
// res.status(...).json(...) de erro na mão; todos usam throw ou next(erro)
// e deixam esse middleware decidir o status e o formato da resposta.
export function middlewareTratamentoErros(
  erro: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (erro instanceof ZodError) {
    return res.status(400).json({
      mensagem: "dados inválidos",
      detalhes: erro.errors.map((problema) => ({
        campo: problema.path.join("."),
        mensagem: problema.message,
      })),
    });
  }

  if (erro instanceof ErroHttp) {
    return res.status(erro.statusCode).json({ mensagem: erro.message });
  }

  console.error(erro);
  return res.status(500).json({ mensagem: "erro interno do servidor" });
}