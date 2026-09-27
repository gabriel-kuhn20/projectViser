import {ModeloCliente} from "../componentes_pessoas/ModeloCliente";

export class ModeloEntrega {
    entregaId: number;
    cliente: ModeloCliente;
    dataEntrega: Date;
    criadoEm: Date;

    constructor(entregaId: number, cliente: ModeloCliente, dataEntrega: Date, criadoEm: Date = new Date()) {
        this.entregaId = entregaId;
        this.cliente = cliente;
        this.dataEntrega = dataEntrega;
        this.criadoEm = criadoEm;
    }
}