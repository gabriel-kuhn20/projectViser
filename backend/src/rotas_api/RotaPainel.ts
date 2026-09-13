import { Router } from "express";
import { controlePainel } from "../controle_regras/ControlePainel";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";

export const rotaPainel = Router();

// RF11 (UC11): quantidade de clientes pendentes em cada marco
rotaPainel.get("/", middlewareAutenticacao, controlePainel.obterResumoPendencias);
