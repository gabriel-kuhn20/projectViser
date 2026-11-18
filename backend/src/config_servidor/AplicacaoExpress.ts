// precisa ser o primeiro import: no Express 4, erros em handlers async
// só chegam ao middleware de erros com este patch
import "express-async-errors";
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { obterOrigemPermitida } from "./ConfiguracaoAmbiente";
import { rotaPrincipal } from "../rotas_api/RotaPrincipal";
import { middlewareRotaNaoEncontrada } from "../middlewares_seguranca/MiddlewareRotaNaoEncontrada";
import { middlewareTratamentoErros } from "../middlewares_seguranca/MiddlewareTratamentoErros";

export function criarAplicacaoExpress(): Express {
  const app = express();

  // a API fica atrás do Nginx: sem isso o limite de login enxergaria só o IP do proxy
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: obterOrigemPermitida() }));
  app.use(express.json());
  app.use("/api", rotaPrincipal);
  app.use(middlewareRotaNaoEncontrada);
  app.use(middlewareTratamentoErros);

  return app;
}