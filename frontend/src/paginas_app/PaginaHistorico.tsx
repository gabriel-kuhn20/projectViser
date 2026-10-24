import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { FormularioInteracao } from "../componentes_interacoes/FormularioInteracao";
import { HistoricoInteracoes } from "../componentes_interacoes/HistoricoInteracoes";
import { buscarClientePorId, type ClienteApi } from "../servicos_api/ApiCliente";
import { listarHistoricoCliente, type InteracaoApi } from "../servicos_api/ApiInteracao";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";
import { IconeVoltar } from "../componentes_layout/IconesMenu";
import { TituloPagina } from "../componentes_layout/TituloPagina";

// UC06 · Consultar histórico do cliente (RF06) / UC07 · Registrar interação (RF05)
export function PaginaHistorico() {
    const { clienteId: clienteIdRota } = useParams();
    const [parametrosBusca] = useSearchParams();
    const clienteId = Number(clienteIdRota);
    // o formulário só aparece quando a tela é aberta a partir de um lembrete:
    // toda interação precisa estar ligada a um lembrete (lembreteId obrigatório na API)
    const lembreteId = Number(parametrosBusca.get("lembreteId")) || null;

    const [clienteSelecionado, definirClienteSelecionado] = useState<ClienteApi | null>(null);
    const [interacoesCliente, definirInteracoesCliente] = useState<InteracaoApi[]>([]);
    const [estaCarregando, definirEstaCarregando] = useState(true);
    const [mensagemErro, definirMensagemErro] = useState<string | null>(null);

    const carregarHistorico = useCallback(async () => {
        definirEstaCarregando(true);
        try {
            const [clienteEncontrado, interacoesEncontradas] = await Promise.all([
                buscarClientePorId(clienteId),
                listarHistoricoCliente(clienteId),
            ]);
            definirClienteSelecionado(clienteEncontrado);
            definirInteracoesCliente(interacoesEncontradas);
            definirMensagemErro(null);
        } catch (erroRequisicao) {
            definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível carregar o histórico do cliente."));
        } finally {
            definirEstaCarregando(false);
        }
    }, [clienteId]);

    useEffect(() => {
        carregarHistorico();
    }, [carregarHistorico]);

    return (
        <div>
            <Link to="/lembretes" className="link-voltar">
                <IconeVoltar className="h-4 w-4" />
                Voltar para lembretes
            </Link>

            <TituloPagina
                titulo={clienteSelecionado ? clienteSelecionado.pessoa.nome : "Histórico do cliente"}
                subtitulo={clienteSelecionado ? `Contato: ${clienteSelecionado.contato}` : undefined}
            />

            {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}

            {lembreteId && <FormularioInteracao lembreteId={lembreteId} aoRegistrar={carregarHistorico} />}

            <HistoricoInteracoes interacoesCliente={interacoesCliente} estaCarregando={estaCarregando} />
        </div>
    );
}