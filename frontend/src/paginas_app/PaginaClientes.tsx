import { useEffect, useState } from "react";
import { TabelaClientes } from "../componentes_pessoas/TabelaClientes";
import { FormularioCliente } from "../componentes_pessoas/FormularioCliente";
import { excluirCliente, listarClientes, type ClienteApi } from "../servicos_api/ApiCliente";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";

// UC02 · Cadastrar cliente / UC03 · Editar cliente
export function PaginaClientes() {

    const { papelAcesso } = usarAutenticacao();
    const [clientes, definirClientes] = useState<ClienteApi[]>([]);
    const [carregando, definirCarregando] = useState(true);
    const [clienteEmEdicao, definirClienteEmEdicao] = useState<ClienteApi | null>(null);
    const [mensagemErro, definirMensagemErro] = useState<string | null>(null);

    useEffect(() => {
        listarClientes()
            .then(definirClientes)
            .catch(() => definirMensagemErro("não foi possível carregar os clientes."))
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

        definirMensagemErro(null);
        try {
            await excluirCliente(cliente.id);
            definirClientes((atuais) => atuais.filter((c) => c.id !== cliente.id));
            if (clienteEmEdicao?.id === cliente.id) definirClienteEmEdicao(null);
        } catch (erro: any) {
            definirMensagemErro(erro?.response?.data?.mensagem ?? "não foi possível excluir o cliente.");
        }
    }

    return (
        <div>
            <h2 className="pagina-titulo">Clientes</h2>
            {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}
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
                exclusaoPermitida={papelAcesso === "admin"}
            />
        </div>
    );
}