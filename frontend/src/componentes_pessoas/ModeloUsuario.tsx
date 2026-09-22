import { ModeloPessoa } from "./ModeloPessoa";

export class ModeloUsuario {
    usuarioId: number;
    email: string;
    senha: string;
    pessoa: ModeloPessoa;

    constructor(usuarioId: number, email: string, senha: string, pessoa: ModeloPessoa) {
        this.usuarioId = usuarioId;
        this.email = email;
        this.senha = senha;
        this.pessoa = pessoa;
    }
}
