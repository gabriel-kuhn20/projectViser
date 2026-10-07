import { Router } from "express";
import { controleCliente } from "../controle_regras/ControleCliente";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";

export const rotaCliente = Router();

rotaCliente.use(middlewareAutenticacao);

// RF02 (UC02)
rotaCliente.post("/", controleCliente.cadastrarCliente);
// Listar e buscar cliente por id
rotaCliente.get("/", controleCliente.listarClientes);
rotaCliente.get("/:clienteId", controleCliente.buscarClientePorId);
// RF09 (UC03)
rotaCliente.put("/:clienteId", controleCliente.editarCliente);
// Excluir cliente
rotaCliente.delete("/:clienteId", controleCliente.excluirCliente);