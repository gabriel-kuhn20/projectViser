import { Request, Response, NextFunction } from "express";
import { ErroHttp } from "./ErroHttp";

// Dispara quando nenhuma rota registrada bateu com a requisição
// (ex: GET /api/rota-que-nao-existe). Precisa ser registrado DEPOIS
// de todas as rotas e ANTES do middlewareTratamentoErros.
export function middlewareRotaNaoEncontrada(req: Request, res: Response, next: NextFunction) {
  next(new ErroHttp(404, `rota ${req.method} ${req.originalUrl} não encontrada`));
}