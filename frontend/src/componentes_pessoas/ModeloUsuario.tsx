import { ModeloPessoa } from "./ModeloPessoa";

export class ModeloUsuario {
    usuarioId: number;
    email: string;
    senha: string;
    pessoa: ModeloPessoa;
    criadoEm: Date;

    constructor(usuarioId: number, email: string, senha: string, pessoa: ModeloPessoa, criadoEm: Date = new Date()) {
        this.usuarioId = usuarioId;
        this.email = email;
        this.senha = senha;
        this.pessoa = pessoa;
        this.criadoEm = criadoEm;
    }
}
