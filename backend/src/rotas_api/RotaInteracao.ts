import { Router } from "express";
import { controleInteracao } from "../controle_regras/ControleInteracao";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";

export const rotaInteracao = Router();

rotaInteracao.use(middlewareAutenticacao);

// RF06 (UC06): histórico completo de interações de um cliente
rotaInteracao.get("/cliente/:clienteId", controleInteracao.listarHistoricoCliente);
// RF07 (UC07 A2): registrar uma tentativa de contato com o cliente
rotaInteracao.post("/", controleInteracao.registrarInteracao);
// RF06 (UC06)
rotaInteracao.get("/:interacaoId", controleInteracao.buscarInteracaoPorId);
// RF07 (UC07 A2): corrigir o texto de uma tentativa (autor ou admin, lembrete pendente)
rotaInteracao.patch("/:interacaoId", controleInteracao.editarInteracao);
// RF07 (UC07 A2): a resposta do cliente pode ser registrada depois, quando ele retornar
rotaInteracao.patch("/:interacaoId/resposta", controleInteracao.registrarRespostaCliente);
// RF07 (UC07 A2): excluir uma tentativa
rotaInteracao.delete("/:interacaoId", controleInteracao.excluirInteracao);
