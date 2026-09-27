import { ModeloEntrega } from "./ModeloEntrega";

export class ModeloMarcoAcompanhamento {
    marcoId: number;
    entrega: ModeloEntrega;
    tipo: string;
    prazoDias: number;
    dataAlvo: Date;
    criadoEm: Date;

    constructor(marcoId: number, entrega: ModeloEntrega, tipo: string, prazoDias: number, dataAlvo: Date, criadoEm: Date = new Date()) {
        this.marcoId = marcoId;
        this.entrega = entrega;
        this.tipo = tipo;
        this.prazoDias = prazoDias;
        this.dataAlvo = dataAlvo;
        this.criadoEm = criadoEm;
    }
}