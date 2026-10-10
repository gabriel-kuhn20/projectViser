import { Router } from "express";
import { controleAtendente } from "../controle_regras/ControleAtendente";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";
import { exigirPapel } from "../middlewares_seguranca/MiddlewarePapel";

export const rotaAtendente = Router();

// RF10: cadastrar novas contas de atendente (UC10), somente admin
rotaAtendente.post("/", middlewareAutenticacao, exigirPapel("admin"), controleAtendente.cadastrarAtendente);