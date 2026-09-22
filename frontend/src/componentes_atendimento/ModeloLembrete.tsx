import { ModeloMarcoAcompanhamento } from "../componentes_entregas/ModeloMarcoAcompanhamento";

export type StatusLembrete = 'pendente' | 'concluido';

export class ModeloLembrete {

    lembreteId: number;
    marco: ModeloMarcoAcompanhamento;
    status: StatusLembrete = 'pendente'
    criadoEm: Date;
    concluidoEm?: Date;



    constructor(lembreteId: number, marco: ModeloMarcoAcompanhamento, status: StatusLembrete, criadoEm: Date = new Date(), concluidoEm?: Date) {
        this.lembreteId = lembreteId;
        this.marco = marco;
        this.status = status;
        this.criadoEm = criadoEm;
        this.concluidoEm = concluidoEm;
    }
}