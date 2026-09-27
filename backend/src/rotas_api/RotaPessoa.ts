import { Router } from "express";
import { controlePessoa } from "../controle_regras/ControlePessoa";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";

export const rotaPessoa = Router();

rotaPessoa.use(middlewareAutenticacao);

rotaPessoa.post("/", controlePessoa.cadastrarPessoa);
rotaPessoa.get("/", controlePessoa.listarPessoas);
rotaPessoa.put("/:pessoaId", controlePessoa.editarPessoa);
rotaPessoa.delete("/:pessoaId", controlePessoa.excluirPessoa);