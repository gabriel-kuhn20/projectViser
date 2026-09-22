import { ModeloUsuario } from "../componentes_pessoas/ModeloUsuario";
import { ModeloLembrete } from "./ModeloLembrete";

export class ModeloEmAtendimento {
    emAtendimentoId: number;
    lembreteId: ModeloLembrete;
    responsavel: ModeloUsuario;
    iniciadoEm: Date;

    constructor(emAtendimentoId: number, lembreteId: ModeloLembrete, responsavel: ModeloUsuario, iniciadoEm: Date) {
        this.emAtendimentoId = emAtendimentoId;
        this.lembreteId = lembreteId;
        this.responsavel = responsavel;
        this.iniciadoEm = iniciadoEm;
    }
}