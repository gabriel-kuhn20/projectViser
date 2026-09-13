import { Router } from "express";
import { controleAtendente } from "../controle_regras/ControleAtendente";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";

export const rotaAtendente = Router();

// RF10: cadastrar novas contas de atendente (UC10)
rotaAtendente.post("/", middlewareAutenticacao, controleAtendente.cadastrarAtendente);
