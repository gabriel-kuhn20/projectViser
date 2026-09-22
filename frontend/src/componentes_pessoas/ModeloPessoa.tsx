export class ModeloPessoa{

  pessoaId: number;
  nome: string;
  email?: string;
  cpf: string;
  criadoEm: Date;

    constructor(pessoaId: number, nome: string, email: string, cpf: string, criadoEm: Date){
        this.pessoaId = pessoaId;
        this.nome = nome;
        this.email = email;
        this.cpf = cpf;
        this.criadoEm = criadoEm;
    }
}
