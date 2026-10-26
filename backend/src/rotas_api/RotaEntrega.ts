import { Router } from "express";
import { controleEntrega } from "../controle_regras/ControleEntrega";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";
import { exigirPapel } from "../middlewares_seguranca/MiddlewarePapel";

export const rotaEntrega = Router();

rotaEntrega.use(middlewareAutenticacao);

// Cadastrar entrega para um cliente que já existe
rotaEntrega.post("/", controleEntrega.cadastrarEntrega);
// Listar entregas de um cliente
rotaEntrega.get("/cliente/:clienteId", controleEntrega.listarEntregasCliente);
// Buscar, editar e excluir entrega por id
rotaEntrega.get("/:entregaId", controleEntrega.buscarEntregaPorId);
rotaEntrega.put("/:entregaId", controleEntrega.editarEntrega);
// RNF06: excluir entrega apaga marcos, lembretes e interações do cliente — mesma restrição
// da exclusão de cliente (UC02, RF11), senão um atendente apaga o histórico por aqui
rotaEntrega.delete("/:entregaId", exigirPapel("admin"), controleEntrega.excluirEntrega);