import { ModeloTag } from "./ModeloTag";
import { ModeloCliente } from "../componentes_pessoas/ModeloCliente";

export class ModeloClienteTag {

    vinculadoEm: Date;
    cliente: ModeloCliente;
    tag: ModeloTag;

    constructor(cliente: ModeloCliente, tag: ModeloTag, vinculadoEm: Date = new Date()) {
    this.vinculadoEm = vinculadoEm;
    this.cliente = cliente;
    this.tag = tag;
}
}