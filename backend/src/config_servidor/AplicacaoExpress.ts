import express, { Express } from "express";
import cors from "cors";
import { rotaPrincipal } from "../rotas_api/RotaPrincipal";
import { middlewareTratamentoErros } from "../middlewares_seguranca/MiddlewareTratamentoErros";

export function criarAplicacaoExpress(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api", rotaPrincipal);
  app.use(middlewareTratamentoErros);

  return app;
}
