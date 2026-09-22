// UC02 · Cadastrar cliente / UC03 · Editar cliente
import { TabelaClientes } from "../componentes_pessoas/TabelaPessoa";
import { FormularioCliente } from "../componentes_pessoas/TabelaUsuario";

export function PaginaClientes() {
  return (
    <div>
      <FormularioCliente />
      <TabelaClientes />
    </div>
  );
}
