import { Router } from "express";
import { controleEntrega } from "../controle_regras/ControleEntrega";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";

export const rotaEntrega = Router();

rotaEntrega.use(middlewareAutenticacao);

// Cadastrar entrega para um cliente que já existe
rotaEntrega.post("/", controleEntrega.cadastrarEntrega);
// Listar entregas de um cliente
rotaEntrega.get("/cliente/:clienteId", controleEntrega.listarEntregasCliente);
// Buscar, editar e excluir entrega por id
rotaEntrega.get("/:entregaId", controleEntrega.buscarEntregaPorId);
rotaEntrega.put("/:entregaId", controleEntrega.editarEntrega);
rotaEntrega.delete("/:entregaId", controleEntrega.excluirEntrega);