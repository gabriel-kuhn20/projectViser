import { ModeloUsuario } from "../componentes_pessoas/ModeloUsuario";
import { ModeloLembrete } from "./ModeloLembrete";

export class ModeloEmAtendimento {
    emAtendimentoId: number;
    lembrete: ModeloLembrete;
    responsavel: ModeloUsuario;
    iniciadoEm: Date;

    constructor(emAtendimentoId: number, lembrete: ModeloLembrete, responsavel: ModeloUsuario, iniciadoEm: Date = new Date()) {
        this.emAtendimentoId = emAtendimentoId;
        this.lembrete = lembrete;
        this.responsavel = responsavel;
        this.iniciadoEm = iniciadoEm;
    }
}