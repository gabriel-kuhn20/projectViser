import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TabelaClientes } from "../componentes_pessoas/TabelaClientes";
import {
    CLIENTES_POR_PAGINA,
    excluirCliente,
    listarClientes,
    type ClienteApi,
    type PaginaClientesApi,
} from "../servicos_api/ApiCliente";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";
import { TituloPagina } from "../componentes_layout/TituloPagina";
import { FiltroTag } from "../componentes_tags/FiltroTag";
import { CampoBusca } from "../componentes_compartilhados/CampoBusca";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

// espera a atendente parar de digitar antes de buscar, senão cada letra vira uma requisição
const ESPERA_BUSCA_MS = 300;

// UC02 · Manter cliente (RF02, RF15): lista com busca e paginação feitas no servidor (RNF01);
// o cadastro fica em /clientes/novo para não carregar a lista só para cadastrar
export function PaginaClientes() {
    const { papelAcesso } = usarAutenticacao();
    const [paginaClientes, definirPaginaClientes] = useState<PaginaClientesApi | null>(null);
    const [carregando, definirCarregando] = useState(true);
    const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
    const [mensagemSucesso, definirMensagemSucesso] = useState<string | null>(null);
    const [termoDigitado, definirTermoDigitado] = useState("");
    const [termoBusca, definirTermoBusca] = useState("");
    const [tagIdFiltro, definirTagIdFiltro] = useState<number | null>(null);
    const [paginaAtual, definirPaginaAtual] = useState(1);
    // digitando rápido, uma resposta antiga pode chegar depois da nova; só a última requisição vale
    const ultimaRequisicao = useRef(0);

    // filtro novo começa da primeira página (a página 4 de uma busca pode nem existir na outra);
    // os dois estados mudam juntos para não disparar uma busca com a página antiga
    useEffect(() => {
        const temporizadorBusca = setTimeout(() => {
            definirTermoBusca(termoDigitado.trim());
            definirPaginaAtual(1);
        }, ESPERA_BUSCA_MS);
        return () => clearTimeout(temporizadorBusca);
    }, [termoDigitado]);

    function aoSelecionarTag(tagId: number | null) {
        definirTagIdFiltro(tagId);
        definirPaginaAtual(1);
    }

    const carregarClientes = useCallback(async () => {
        const numeroRequisicao = ++ultimaRequisicao.current;
        definirCarregando(true);
        try {
            const paginaRecebida = await listarClientes({ busca: termoBusca, tagId: tagIdFiltro, pagina: paginaAtual });
            if (numeroRequisicao !== ultimaRequisicao.current) return;
            definirPaginaClientes(paginaRecebida);
            definirMensagemErro(null);
        } catch (erroRequisicao) {
            definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível carregar os clientes."));
        } finally {
            if (numeroRequisicao === ultimaRequisicao.current) definirCarregando(false);
        }
    }, [termoBusca, tagIdFiltro, paginaAtual]);

    useEffect(() => {
        carregarClientes();
    }, [carregarClientes]);

    async function aoExcluirCliente(cliente: ClienteApi) {
        const confirmou = window.confirm(`Excluir o cliente "${cliente.pessoa.nome}"? Essa ação não pode ser desfeita.`);
        if (!confirmou) return;

        definirMensagemErro(null);
        definirMensagemSucesso(null);
        try {
            await excluirCliente(cliente.id);
            definirMensagemSucesso(`cliente ${cliente.pessoa.nome} excluído.`);
            // era o último da página: volta uma, senão a tela ficaria numa página vazia
            const eraUltimoDaPagina = paginaClientes?.clientes.length === 1 && paginaAtual > 1;
            if (eraUltimoDaPagina) {
                definirPaginaAtual((pagina) => pagina - 1);
                return;
            }
            await carregarClientes();
        } catch (erroRequisicao) {
            definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível excluir o cliente."));
        }
    }

    const filtroAtivo = tagIdFiltro !== null || termoBusca !== "";
    const totalPaginas = paginaClientes?.totalPaginas ?? 1;
    const primeiroDaPagina = paginaClientes && paginaClientes.total > 0 ? (paginaAtual - 1) * CLIENTES_POR_PAGINA + 1 : 0;
    const ultimoDaPagina = paginaClientes ? primeiroDaPagina + paginaClientes.clientes.length - 1 : 0;

    return (
        <div>
            <TituloPagina
                titulo="Clientes"
                subtitulo="Busque pelo nome, telefone ou endereço. Os lembretes são criados a partir da data de entrega."
                acao={
                    <Link to="/clientes/novo" className="botao-primario w-auto">
                        Novo cliente
                    </Link>
                }
            />
            {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}
            {mensagemSucesso && <p role="status" className="mensagem-sucesso">{mensagemSucesso}</p>}

            <div className="flex flex-wrap items-end gap-4">
                <CampoBusca
                    rotulo="Buscar cliente"
                    valor={termoDigitado}
                    aoAlterar={definirTermoDigitado}
                    placeholder="nome, telefone ou endereço"
                />
                <FiltroTag tagIdSelecionada={tagIdFiltro} aoSelecionar={aoSelecionarTag} />
            </div>

            <TabelaClientes
                clientes={paginaClientes?.clientes ?? []}
                filtroAtivo={filtroAtivo}
                carregando={carregando && !paginaClientes}
                aoExcluir={aoExcluirCliente}
                exclusaoPermitida={papelAcesso === "admin"}
            />

            {paginaClientes && paginaClientes.total > 0 && (
                <nav aria-label="Páginas da lista de clientes" className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[14px] text-black/60">
                        {primeiroDaPagina}–{ultimoDaPagina} de {paginaClientes.total}{" "}
                        {paginaClientes.total === 1 ? "cliente" : "clientes"}
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="botao-secundario"
                            onClick={() => definirPaginaAtual((pagina) => pagina - 1)}
                            disabled={paginaAtual <= 1 || carregando}
                        >
                            Anterior
                        </button>
                        <button
                            type="button"
                            className="botao-secundario"
                            onClick={() => definirPaginaAtual((pagina) => pagina + 1)}
                            disabled={paginaAtual >= totalPaginas || carregando}
                        >
                            Próxima
                        </button>
                    </div>
                </nav>
            )}
        </div>
    );
}
