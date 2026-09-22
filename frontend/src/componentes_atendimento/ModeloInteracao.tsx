import { ModeloUsuario } from "../componentes_pessoas/ModeloUsuario";
import { ModeloLembrete } from "./ModeloLembrete";

export class ModeloInteracao {
    interacaoId: number;
    lembrete: ModeloLembrete;
    autor: ModeloUsuario;
    conteudo: string;
    respostaCliente?: string;
    criadoEm: Date;

    constructor(interacaoId: number, lembrete: ModeloLembrete, autor: ModeloUsuario, conteudo: string, criadoEm: Date = new Date(), respostaCliente?: string) {
        this.interacaoId = interacaoId;
        this.lembrete = lembrete;
        this.autor = autor;
        this.conteudo = conteudo;
        this.criadoEm = criadoEm;
        this.respostaCliente = respostaCliente;
    }
}