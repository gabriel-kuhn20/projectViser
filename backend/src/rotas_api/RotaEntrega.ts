import { Router } from "express";
import { controleEntrega } from "../controle_regras/ControleEntrega";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";

export const rotaEntrega = Router();

rotaEntrega.use(middlewareAutenticacao);

// RF02 (UC02): cadastrar entrega para um cliente que já existe
rotaEntrega.post("/", controleEntrega.cadastrarEntrega);
// RF02 (UC02): listar entregas de um cliente
rotaEntrega.get("/cliente/:clienteId", controleEntrega.listarEntregasCliente);
// RF02 (UC02): buscar, editar e excluir entrega por id
rotaEntrega.get("/:entregaId", controleEntrega.buscarEntregaPorId);
rotaEntrega.put("/:entregaId", controleEntrega.editarEntrega);
// RNF06: a atendente só exclui compra sem contato registrado (erro de cadastro); com histórico,
// só o admin — a checagem fica no controller porque depende dos dados da entrega
rotaEntrega.delete("/:entregaId", controleEntrega.excluirEntrega);