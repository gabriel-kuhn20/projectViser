import { Router } from "express";
import { controleInteracao } from "../controle_regras/ControleInteracao";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";

export const rotaInteracao = Router();

rotaInteracao.use(middlewareAutenticacao);

// RF06 (UC06): histórico completo de interações de um cliente
rotaInteracao.get("/cliente/:clienteId", controleInteracao.listarHistoricoCliente);
// RF05 (UC07): registrar uma interação com o cliente
rotaInteracao.post("/", controleInteracao.registrarInteracao);
// RF06 (UC06)
rotaInteracao.get("/:interacaoId", controleInteracao.buscarInteracaoPorId);
// RF05 (UC07)
// RF05: corrigir o texto de uma tentativa (autor ou admin, lembrete pendente)
rotaInteracao.patch("/:interacaoId", controleInteracao.editarInteracao);
rotaInteracao.patch("/:interacaoId/resposta", controleInteracao.registrarRespostaCliente);
// Excluir interação
rotaInteracao.delete("/:interacaoId", controleInteracao.excluirInteracao);
