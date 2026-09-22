import { ModeloUsuario } from "../componentes_pessoas/ModeloUsuario";
import { ModeloLembrete } from "./ModeloLembrete";

export class ModeloEmAtendimento {
    interacaoId: number;
    lembreteId: ModeloLembrete;
    responsavel: ModeloUsuario;
    conteudo: string;
    respostaCliente?: string;
    criadoEm: Date;

    constructor(interacaoId: number, lembreteId: ModeloLembrete, responsavel: ModeloUsuario, conteudo: string, criadoEm: Date, respostaCliente?: string) {
        this.interacaoId = interacaoId;
        this.lembreteId = lembreteId;
        this.responsavel = responsavel;
        this.conteudo = conteudo;
        this.criadoEm = criadoEm;
        this.respostaCliente = respostaCliente;
    }
}