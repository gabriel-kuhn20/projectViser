import { Request, Response, NextFunction } from "express";
import { PapelAcesso } from "@prisma/client";
import { ErroHttp } from "./ErroHttp";

// precisa rodar DEPOIS do middlewareAutenticacao (ele preenche req.usuarioLogado)
export function exigirPapel(...papeisPermitidos: PapelAcesso[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const papelAcesso = req.usuarioLogado?.papelAcesso;

    if (!papelAcesso || !papeisPermitidos.includes(papelAcesso)) {
      return next(new ErroHttp(403, "você não tem permissão para esta ação"));
    }

    next();
  };
}