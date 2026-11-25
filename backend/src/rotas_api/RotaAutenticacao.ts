import { Router } from "express";
import { controleAutenticacao } from "../controle_regras/ControleAutenticacao";
import { middlewareAutenticacao } from "../middlewares_seguranca/MiddlewareAutenticacao";
import { middlewareLimiteLogin } from "../middlewares_seguranca/MiddlewareLimiteLogin";

export const rotaAutenticacao = Router();

// RF01 (UC01): atendente ou administrador entra com e-mail e senha; RNF09: limite de tentativas por IP
rotaAutenticacao.post("/login", middlewareLimiteLogin, controleAutenticacao.efetuarLogin);

// exige estar logado: é o token do cabeçalho que será encerrado
// RF01 (UC01)
rotaAutenticacao.post("/sair", middlewareAutenticacao, controleAutenticacao.encerrarSessao);

// as duas rotas abaixo ficam fora do middlewareAutenticacao de propósito: quem perdeu
// a senha não tem como se autenticar — o que autoriza a troca é o link enviado por e-mail
// RF20 (UC12)
rotaAutenticacao.post("/recuperacao-senha", controleAutenticacao.solicitarRecuperacaoSenha);
// RF20 (UC12)
rotaAutenticacao.post("/redefinir-senha", controleAutenticacao.redefinirSenha);

// esta, ao contrário das duas acima, exige estar logado: é a pessoa trocando a própria
// senha, e o middleware é quem diz de quem é a conta
// RF21 (UC13)
rotaAutenticacao.patch("/senha", middlewareAutenticacao, controleAutenticacao.trocarPropriaSenha);
