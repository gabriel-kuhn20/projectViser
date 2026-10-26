import { Link, useNavigate } from "react-router-dom";
import { FormularioCliente } from "../componentes_pessoas/FormularioCliente";
import { type ClienteApi } from "../servicos_api/ApiCliente";
import { IconeVoltar } from "../componentes_layout/IconesMenu";
import { TituloPagina } from "../componentes_layout/TituloPagina";

// UC02 · Manter cliente (RF02): cadastro numa tela própria, sem carregar a lista de clientes
export function PaginaNovoCliente() {
    const navegar = useNavigate();

    // depois de cadastrar abre a tela do cliente (RF18), onde já aparecem a entrega e os marcos;
    // a mensagem de sucesso (RF15) vai junto na navegação
    function aoCadastrarCliente(novoCliente: ClienteApi) {
        navegar(`/historico/${novoCliente.id}`, {
            state: { mensagemSucesso: `cliente ${novoCliente.pessoa.nome} cadastrado.` },
        });
    }

    return (
        <div>
            <Link to="/clientes" className="link-voltar">
                <IconeVoltar className="h-4 w-4" />
                Voltar para clientes
            </Link>
            <TituloPagina
                titulo="Novo cliente"
                subtitulo="A primeira entrega vai junto com o cadastro; os lembretes são criados a partir da data dela."
            />
            <FormularioCliente clienteEmEdicao={null} aoSalvar={aoCadastrarCliente} aoCancelarEdicao={() => navegar("/clientes")} />
        </div>
    );
}
