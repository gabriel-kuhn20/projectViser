import { Router } from "express";
import { rotaAutenticacao } from "./RotaAutenticacao";
import { rotaAtendente } from "./RotaAtendente";
import { rotaCliente } from "./RotaCliente";
import { rotaLembrete } from "./RotaLembrete";
import { rotaInteracao } from "./RotaInteracao";
import { rotaPainel } from "./RotaPainel";
import { rotaTag } from "./RotaTag";
import { rotaEntrega } from "./RotaEntrega";
import { rotaTipoMarco } from "./RotaTipoMarco";

export const rotaPrincipal = Router();

rotaPrincipal.use("/autenticacao", rotaAutenticacao); // UC01
rotaPrincipal.use("/atendentes", rotaAtendente);       // UC10
rotaPrincipal.use("/clientes", rotaCliente);           // UC02, UC11
rotaPrincipal.use("/lembretes", rotaLembrete);         // UC05, UC07, UC08
rotaPrincipal.use("/interacoes", rotaInteracao);       // UC06, UC07
rotaPrincipal.use("/painel", rotaPainel);              // UC09
rotaPrincipal.use("/tags", rotaTag);                  // UC11
rotaPrincipal.use("/entregas", rotaEntrega);          // UC02
rotaPrincipal.use("/tipos-marco", rotaTipoMarco);  // UC15: marcos definidos pelo administrador