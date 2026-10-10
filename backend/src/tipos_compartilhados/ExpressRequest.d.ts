import { JwtPayload } from "jsonwebtoken";
import { PapelAcesso } from "@prisma/client";

// dados do JWT, preenchidos pelo middlewareAutenticacao
declare global {
  namespace Express {
    interface Request {
      usuarioLogado?: JwtPayload & { usuarioId: number; papelAcesso: PapelAcesso };
    }
  }
}

export {};