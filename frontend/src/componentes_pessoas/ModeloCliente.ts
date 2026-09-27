import { ModeloUsuario } from "./ModeloUsuario";
import { ModeloPessoa } from "./ModeloPessoa";

export class ModeloCliente {
    clienteId: number;
    contato: string;
    endereco?: string;
    pessoa: ModeloPessoa;
    responsavel?: ModeloUsuario;
    criadoEm: Date;


    constructor(clienteId: number, contato: string, pessoa: ModeloPessoa, criadoEm: Date = new Date(), responsavel?: ModeloUsuario, endereco?: string) {
        this.clienteId = clienteId;
        this.contato = contato;
        this.pessoa = pessoa;
        this.criadoEm = criadoEm;
        this.responsavel = responsavel;
        this.endereco = endereco;
    }
}
