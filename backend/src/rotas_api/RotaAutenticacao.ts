import { Router } from "express";
import { controleAutenticacao } from "../controle_regras/ControleAutenticacao";

export const rotaAutenticacao = Router();

// RF01: o sistema permite que o atendente acesse com email e senha
rotaAutenticacao.post("/login", controleAutenticacao.efetuarLogin);

// as duas rotas abaixo ficam fora do middlewareAutenticacao de propósito: quem perdeu
// a senha não tem como se autenticar — o que autoriza a troca é o link enviado por e-mail
// RF20 (UC12)
rotaAutenticacao.post("/recuperacao-senha", controleAutenticacao.solicitarRecuperacaoSenha);
// RF20 (UC12)
rotaAutenticacao.post("/redefinir-senha", controleAutenticacao.redefinirSenha);
