import { JwtPayload } from "jsonwebtoken";

// dados do JWT, preenchidos pelo middlewareAutenticacao
declare global {
  namespace Express {
    interface Request {
      usuarioLogado?: JwtPayload & { usuarioId: number };
    }
  }
}

export {};