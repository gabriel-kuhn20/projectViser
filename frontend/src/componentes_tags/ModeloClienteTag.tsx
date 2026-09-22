import { ModeloTag } from "./ModeloTag";
import { ModeloCliente } from "../componentes_pessoas/ModeloCliente";

export class ModeloClienteTag {

    criadoEm: Date;
    cliente: ModeloCliente;
    tag: ModeloTag;

    constructor(cliente: ModeloCliente, tag: ModeloTag, criadoEm: Date = new Date()) {
    this.criadoEm = criadoEm;
    this.cliente = cliente;
    this.tag = tag;
}
}