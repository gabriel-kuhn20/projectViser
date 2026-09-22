export class ModeloLembrete {

    lembreteId: number;
    marcoId: number;
    status: string;
    criadoEm: Date;
    concluidoEm?: Date;
    
    //aguardando o Lucca fazer o componentes entregas para se ter o marcoId do import


    constructor(lembreteId: number, marcoId: number, status: string, criadoEm: Date, concluidoEm?: Date) {
        this.lembreteId = lembreteId;
        this.marcoId = marcoId;
        this.status = status;
        this.criadoEm = criadoEm;
        this.concluidoEm = concluidoEm;

    }
}