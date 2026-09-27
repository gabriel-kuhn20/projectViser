import { Router } from "express";
import { controleTag } from "../controle_regras/ControleTag";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";

export const rotaTag = Router();

rotaTag.use(middlewareAutenticacao);

rotaTag.post("/", controleTag.cadastrarTag);
rotaTag.get("/", controleTag.listarTags);
rotaTag.put("/:tagId", controleTag.editarTag);
rotaTag.delete("/:tagId", controleTag.excluirTag);