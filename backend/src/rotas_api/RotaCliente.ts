import { Router } from "express";
import { controleCliente } from "../controle_regras/ControleCliente";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";
import { exigirPapel } from "../middlewares_seguranca/MiddlewarePapel";


export const rotaCliente = Router();

rotaCliente.use(middlewareAutenticacao);

// RF02 (UC02)
rotaCliente.post("/", exigirPapel("admin"), controleCliente.cadastrarCliente);
// Listar e buscar cliente por id
rotaCliente.get("/", controleCliente.listarClientes);
rotaCliente.get("/:clienteId", controleCliente.buscarClientePorId);
// RF09 (UC03)
rotaCliente.put("/:clienteId", exigirPapel("admin"), controleCliente.editarCliente);
// Excluir cliente
rotaCliente.delete("/:clienteId", exigirPapel("admin"), controleCliente.excluirCliente);