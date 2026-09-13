// UC02 · Cadastrar cliente / UC03 · Editar cliente
import { TabelaClientes } from "../componentes_clientes/TabelaClientes";
import { FormularioCliente } from "../componentes_clientes/FormularioCliente";

export function PaginaClientes() {
  return (
    <div>
      <FormularioCliente />
      <TabelaClientes />
    </div>
  );
}
