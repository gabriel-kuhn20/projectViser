import { JwtPayload } from "jsonwebtoken";

// extende o Request do Express com os dados decodificados do JWT,
// preenchidos pelo middlewareAutenticacao (ver MiddlewareAutenticacao.ts)
declare global {
  namespace Express {
    interface Request {
      usuarioLogado?: string | JwtPayload;
    }
  }
}

export {};
