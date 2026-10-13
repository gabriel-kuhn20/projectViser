import { Router } from "express";
import { controleAtendente } from "../controle_regras/ControleAtendente";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";
import { exigirPapel } from "../middlewares_seguranca/MiddlewarePapel";

export const rotaAtendente = Router();

rotaAtendente.use(middlewareAutenticacao);

// leitura liberada a qualquer usuário logado — o cadastro de cliente precisa escolher o atendente responsável (RF02)
rotaAtendente.get("/", controleAtendente.listarAtendentes);
rotaAtendente.get("/:usuarioId", controleAtendente.buscarAtendentePorId);

// RF09 (UC10)
rotaAtendente.post("/", exigirPapel("admin"), controleAtendente.cadastrarAtendente);
// RNF06: editar e excluir contas é só do administrador, conferido no servidor
rotaAtendente.put("/:usuarioId", exigirPapel("admin"), controleAtendente.editarAtendente);
rotaAtendente.delete("/:usuarioId", exigirPapel("admin"), controleAtendente.excluirAtendente);