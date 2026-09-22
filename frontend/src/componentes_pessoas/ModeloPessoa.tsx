export class ModeloPessoa{

  pessoaId: Number;
  nome: String;
  email?: String;
  cpf: String;
  criadoEm: Date;

    constructor(pessoaId: Number, nome: String, email: String, cpf: String, criadoEm: Date){
        this.pessoaId = pessoaId;
        this.nome = nome;
        this.email = email;
        this.cpf = cpf;
        this.criadoEm = criadoEm;
    }
}
