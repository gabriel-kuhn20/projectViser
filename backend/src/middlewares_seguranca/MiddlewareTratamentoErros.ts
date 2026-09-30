import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { ErroHttp } from "./ErroHttp";

// centraliza toda resposta de erro da API: controllers usam throw e este
// middleware decide status e formato
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

  // JSON malformado (lançado pelo express.json)
  if (erro instanceof SyntaxError && "body" in erro) {
    return res.status(400).json({ mensagem: "corpo da requisição não é um JSON válido" });
  }

  if (erro instanceof Prisma.PrismaClientKnownRequestError) {
    if (erro.code === "P2002") {
      return res.status(409).json({ mensagem: "já existe um registro com esse valor" });
    }
    if (erro.code === "P2025") {
      return res.status(404).json({ mensagem: "registro não encontrado" });
    }
    if (erro.code === "P2003") {
      return res.status(409).json({ mensagem: "operação bloqueada: existem registros vinculados" });
    }
  }

  console.error(erro);
  return res.status(500).json({ mensagem: "erro interno do servidor" });
}