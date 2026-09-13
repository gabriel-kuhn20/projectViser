import { Router } from "express";
import { controleAutenticacao } from "../controle_regras/ControleAutenticacao";

export const rotaAutenticacao = Router();

// RF01: o sistema permite que o atendente acesse com email e senha
rotaAutenticacao.post("/login", controleAutenticacao.efetuarLogin);
