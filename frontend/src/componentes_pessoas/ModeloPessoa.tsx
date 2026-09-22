export class ModeloPessoa {

  pessoaId: number;
  nome: string;
  email?: string;
  cpf?: string;
  criadoEm: Date;

  constructor(pessoaId: number, nome: string, criadoEm: Date = new Date(), email?: string, cpf?: string) {
    this.pessoaId = pessoaId;
    this.nome = nome;
    this.criadoEm = criadoEm;
    this.email = email;
    this.cpf = cpf;
  }
}
