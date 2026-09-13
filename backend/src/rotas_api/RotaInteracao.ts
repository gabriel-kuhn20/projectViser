import { Router } from "express";
import { controleInteracao } from "../controle_regras/ControleInteracao";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";

export const rotaInteracao = Router();

rotaInteracao.use(middlewareAutenticacao);

// RF06 (UC06): histórico completo de interações de um cliente
rotaInteracao.get("/cliente/:clienteId", controleInteracao.listarHistoricoCliente);
// RF05 (UC07): registrar uma interação com o cliente
rotaInteracao.post("/", controleInteracao.registrarInteracao);
