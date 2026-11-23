import { ModeloPessoa } from "./ModeloPessoa";

export class ModeloCliente {
    clienteId: number;
    contato: string;
    endereco?: string;
    pessoa: ModeloPessoa;
    criadoEm: Date;


    constructor(clienteId: number, contato: string, pessoa: ModeloPessoa, criadoEm: Date = new Date(), endereco?: string) {
        this.clienteId = clienteId;
        this.contato = contato;
        this.pessoa = pessoa;
        this.criadoEm = criadoEm;
        this.endereco = endereco;
    }
}
