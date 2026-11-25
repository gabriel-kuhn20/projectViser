import { Router } from "express";
import { controleTag } from "../controle_regras/ControleTag";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";
import { exigirPapel } from "../middlewares_seguranca/MiddlewarePapel";


export const rotaTag = Router();

rotaTag.use(middlewareAutenticacao);

// RF12 (UC11): qualquer usuário logado lista as tags; criar, renomear e excluir é só do administrador (RF11, RNF06)
rotaTag.get("/", controleTag.listarTags);
rotaTag.get("/:tagId", controleTag.buscarTagPorId);
rotaTag.post("/", exigirPapel("admin"), controleTag.cadastrarTag);
rotaTag.put("/:tagId", exigirPapel("admin"), controleTag.editarTag);
rotaTag.delete("/:tagId", exigirPapel("admin"), controleTag.excluirTag);