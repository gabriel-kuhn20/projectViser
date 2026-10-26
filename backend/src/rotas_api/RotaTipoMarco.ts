import { Router } from "express";
import { controleTipoMarco } from "../controle_regras/ControleTipoMarco";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";
import { exigirPapel } from "../middlewares_seguranca/MiddlewarePapel";

export const rotaTipoMarco = Router();

rotaTipoMarco.use(middlewareAutenticacao);

// leitura liberada a qualquer usuário logado: as abas de lembretes e o painel dependem dela
rotaTipoMarco.get("/", controleTipoMarco.listarTiposMarco);
// RF03 (UC04) / RNF06: só o administrador define os marcos, conferido no servidor
rotaTipoMarco.post("/", exigirPapel("admin"), controleTipoMarco.cadastrarTipoMarco);
rotaTipoMarco.put("/:tipoMarcoId", exigirPapel("admin"), controleTipoMarco.editarTipoMarco);
rotaTipoMarco.delete("/:tipoMarcoId", exigirPapel("admin"), controleTipoMarco.excluirTipoMarco);
