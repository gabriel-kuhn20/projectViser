export class ModeloTag {

    tagId: number;
    nome: string;
    criadoEm: Date;

    constructor(tagId: number, nome: string, criadoEm: Date = new Date()) {
        this.tagId = tagId;
        this.nome = nome;
        this.criadoEm = criadoEm;
    }

}
