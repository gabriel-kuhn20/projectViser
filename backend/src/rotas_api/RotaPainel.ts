import { Router } from "express";
import { controlePainel } from "../controle_regras/ControlePainel";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";

export const rotaPainel = Router();

// RF10/RF19 (UC09): pendências por marco, meus atendimentos, próximo cliente e contatos
rotaPainel.get("/", middlewareAutenticacao, controlePainel.obterPainel);
