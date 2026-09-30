import { useEffect, useState } from "react";
import { TabelaClientes } from "../componentes_pessoas/TabelaClientes";
import { FormularioCliente } from "../componentes_pessoas/FormularioCliente";
import { excluirCliente, listarClientes, type ClienteApi } from "../servicos_api/ApiCliente";

// UC02 · Cadastrar cliente / UC03 · Editar cliente
export function PaginaClientes() {
  const [clientes, definirClientes] = useState<ClienteApi[]>([]);
  const [carregando, definirCarregando] = useState(true);
  const [clienteEmEdicao, definirClienteEmEdicao] = useState<ClienteApi | null>(null);

  useEffect(() => {
    listarClientes()
      .then(definirClientes)
      .catch(() => definirClientes([]))
      .finally(() => definirCarregando(false));
  }, []);

  function aoSalvarCliente(cliente: ClienteApi) {
    definirClientes((atuais) => {
      const jaExiste = atuais.some((c) => c.id === cliente.id);
      if (jaExiste) return atuais.map((c) => (c.id === cliente.id ? cliente : c));
      return [cliente, ...atuais];
    });
    definirClienteEmEdicao(null);
  }

  async function aoExcluirCliente(cliente: ClienteApi) {
    const confirmou = window.confirm(`Excluir o cliente "${cliente.pessoa.nome}"? Essa ação não pode ser desfeita.`);
    if (!confirmou) return;

    await excluirCliente(cliente.pessoaId);
    definirClientes((atuais) => atuais.filter((c) => c.id !== cliente.id));
    if (clienteEmEdicao?.id === cliente.id) definirClienteEmEdicao(null);
  }

  return (
    <div>
      <h2 className="pagina-titulo">Clientes</h2>
      <FormularioCliente
        clienteEmEdicao={clienteEmEdicao}
        aoSalvar={aoSalvarCliente}
        aoCancelarEdicao={() => definirClienteEmEdicao(null)}
      />
      <TabelaClientes
        clientes={clientes}
        carregando={carregando}
        aoEditar={definirClienteEmEdicao}
        aoExcluir={aoExcluirCliente}
      />
    </div>
  );
}
