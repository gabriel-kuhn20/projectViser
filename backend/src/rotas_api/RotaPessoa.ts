import { Router } from "express";
import { controlePessoa } from "../controle_regras/ControlePessoa";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";
import { exigirPapel } from "../middlewares_seguranca/MiddlewarePapel";

export const rotaPessoa = Router();

rotaPessoa.use(middlewareAutenticacao);

rotaPessoa.post("/", controlePessoa.cadastrarPessoa);
rotaPessoa.get("/", controlePessoa.listarPessoas);
rotaPessoa.get("/:pessoaId", controlePessoa.buscarPessoaPorId);
rotaPessoa.put("/:pessoaId", controlePessoa.editarPessoa);
// exclusão apaga em cascata (clientes, lembretes, interações), somente admin
rotaPessoa.delete("/:pessoaId", exigirPapel("admin"), controlePessoa.excluirPessoa);