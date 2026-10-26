import { Router } from "express";
import { controleLembrete } from "../controle_regras/ControleLembrete";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";
import { exigirPapel } from "../middlewares_seguranca/MiddlewarePapel";

export const rotaLembrete = Router();

rotaLembrete.use(middlewareAutenticacao);

// RF04 (UC05): lista de lembretes pendentes por marco
rotaLembrete.get("/marco/:tipoMarcoId", controleLembrete.listarPorMarco);
// RF07 (UC08): concluir lembrete, exige interação já registrada
rotaLembrete.patch("/:lembreteId/concluir", controleLembrete.concluirLembrete);
// RF07 (UC07 A3): só o admin desfaz uma conclusão feita por engano
rotaLembrete.patch("/:lembreteId/reabrir", exigirPapel("admin"), controleLembrete.reabrirLembrete);
// RF08 (UC09): marcar/desmarcar como "em atendimento"
rotaLembrete.patch("/:lembreteId/em-atendimento", controleLembrete.marcarEmAtendimento);
rotaLembrete.delete("/:lembreteId/em-atendimento", controleLembrete.desmarcarEmAtendimento);
