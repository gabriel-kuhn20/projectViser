// UC02 · Cadastrar cliente / UC03 · Editar cliente
import { TabelaClientes } from "../componentes_pessoas/TabelaClientes";
import { FormularioCliente } from "../componentes_pessoas/FormularioCliente";

export function PaginaClientes() {
  return (
    <div>
      <h2 className="pagina-titulo">Clientes</h2>
      <FormularioCliente />
      <TabelaClientes />
    </div>
  );
}
