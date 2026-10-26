import { Router } from "express";
import { controleCliente } from "../controle_regras/ControleCliente";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";
import { exigirPapel } from "../middlewares_seguranca/MiddlewarePapel";


export const rotaCliente = Router();

rotaCliente.use(middlewareAutenticacao);

// RF02 (UC02)
rotaCliente.post("/", controleCliente.cadastrarCliente);
// Listar e buscar cliente por id
rotaCliente.get("/", controleCliente.listarClientes);
rotaCliente.get("/:clienteId", controleCliente.buscarClientePorId);
// RF09 (UC03)
rotaCliente.put("/:clienteId", controleCliente.editarCliente);
// Excluir cliente: só o administrador (RF11, RNF06)
rotaCliente.delete("/:clienteId", exigirPapel("admin"), controleCliente.excluirCliente);
// RF12 (UC11): vincular tags ao cliente é gestão de tags, só do administrador (RF11, RNF06)
rotaCliente.put("/:clienteId/tags", exigirPapel("admin"), controleCliente.definirTagsCliente);