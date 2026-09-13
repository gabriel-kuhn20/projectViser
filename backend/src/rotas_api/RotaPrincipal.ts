import { Router } from "express";
import { rotaAutenticacao } from "./RotaAutenticacao";
import { rotaAtendente } from "./RotaAtendente";
import { rotaCliente } from "./RotaCliente";
import { rotaLembrete } from "./RotaLembrete";
import { rotaInteracao } from "./RotaInteracao";
import { rotaPainel } from "./RotaPainel";

export const rotaPrincipal = Router();

rotaPrincipal.use("/autenticacao", rotaAutenticacao); // UC01
rotaPrincipal.use("/atendentes", rotaAtendente);       // UC10
rotaPrincipal.use("/clientes", rotaCliente);           // UC02, UC03
rotaPrincipal.use("/lembretes", rotaLembrete);         // UC05, UC08, UC09
rotaPrincipal.use("/interacoes", rotaInteracao);       // UC06, UC07
rotaPrincipal.use("/painel", rotaPainel);              // UC11
