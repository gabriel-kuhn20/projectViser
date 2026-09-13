import { Router } from "express";
import { controleCliente } from "../controle_regras/ControleCliente";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";

export const rotaCliente = Router();

rotaCliente.use(middlewareAutenticacao);

// RF02 (UC02)
rotaCliente.post("/", controleCliente.cadastrarCliente);
// RF09 (UC03)
rotaCliente.put("/:clienteId", controleCliente.editarCliente);
