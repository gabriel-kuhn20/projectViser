// UC02 · Cadastrar cliente / UC03 · Editar cliente
import { TabelaClientes } from "../componentes_pessoas/TabelaClientes";
import { FormularioCliente } from "../componentes_pessoas/FormularioCliente";

export function PaginaClientes() {
  return (
    <div>
      <FormularioCliente />
      <TabelaClientes />
    </div>
  );
}
