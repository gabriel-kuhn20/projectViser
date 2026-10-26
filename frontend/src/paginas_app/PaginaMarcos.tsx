import { useCallback, useEffect, useState } from "react";
import { FormularioMarco } from "../componentes_marcos/FormularioMarco";
import { TabelaMarcos } from "../componentes_marcos/TabelaMarcos";
import { editarTipoMarco, excluirTipoMarco, listarTiposMarco, type TipoMarcoApi } from "../servicos_api/ApiTipoMarco";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";
import { TituloPagina } from "../componentes_layout/TituloPagina";

// UC04 · Calcular marcos de acompanhamento (RF03): os marcos deixam de ser fixos (7 dias, 2 meses
// e 1 ano) e passam a ser definidos pelo administrador — só ele acessa esta tela (RNF06)
export function PaginaMarcos() {
    const [marcos, definirMarcos] = useState<TipoMarcoApi[]>([]);
    const [carregando, definirCarregando] = useState(true);
    const [marcoEmEdicao, definirMarcoEmEdicao] = useState<TipoMarcoApi | null>(null);
    const [marcoEmAcao, definirMarcoEmAcao] = useState<number | null>(null);
    const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
    const [mensagemSucesso, definirMensagemSucesso] = useState<string | null>(null);

    // recarrega depois de cada ação: o total de lembretes gerados (que trava os dias) vem da API
    const carregarMarcos = useCallback(async () => {
        try {
            definirMarcos(await listarTiposMarco());
        } catch (erroRequisicao) {
            definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível carregar os marcos."));
        } finally {
            definirCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarMarcos();
    }, [carregarMarcos]);

    async function aoSalvarMarco(marcoSalvo: TipoMarcoApi, estavaEditando: boolean) {
        definirMensagemErro(null);
        definirMensagemSucesso(
            estavaEditando
                ? `marco ${marcoSalvo.nome} atualizado.`
                : `marco ${marcoSalvo.nome} cadastrado. novas entregas já recebem esse contato.`
        );
        definirMarcoEmEdicao(null);
        await carregarMarcos();
    }

    async function executarAcaoMarco(marco: TipoMarcoApi, acaoMarco: () => Promise<unknown>, mensagemOk: string, mensagemFalha: string) {
        definirMensagemErro(null);
        definirMensagemSucesso(null);
        definirMarcoEmAcao(marco.id);
        try {
            await acaoMarco();
            definirMensagemSucesso(mensagemOk);
            if (marcoEmEdicao?.id === marco.id) definirMarcoEmEdicao(null);
        } catch (erroRequisicao) {
            definirMensagemErro(formatarMensagemErro(erroRequisicao, mensagemFalha));
        } finally {
            definirMarcoEmAcao(null);
            await carregarMarcos();
        }
    }

    // desativado, o marco sai das abas e para de gerar lembretes; os que já existem continuam no histórico
    function aoAlternarAtivo(marco: TipoMarcoApi) {
        const novoAtivo = !marco.ativo;
        executarAcaoMarco(
            marco,
            () => editarTipoMarco(marco.id, { ativo: novoAtivo }),
            `marco ${marco.nome} ${novoAtivo ? "ativado" : "desativado"}.`,
            "não foi possível alterar o marco."
        );
    }

    function aoExcluirMarco(marco: TipoMarcoApi) {
        const confirmou = window.confirm(`Excluir o marco "${marco.nome}"?`);
        if (!confirmou) return;
        executarAcaoMarco(marco, () => excluirTipoMarco(marco.id), `marco ${marco.nome} excluído.`, "não foi possível excluir o marco.");
    }

    return (
        <div>
            <TituloPagina
                titulo="Marcos"
                subtitulo="Em quantos dias após a entrega a equipe entra em contato com o cliente."
            />
            {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}
            {mensagemSucesso && <p role="status" className="mensagem-sucesso">{mensagemSucesso}</p>}
            <p className="mb-6 max-w-[70ch] text-[14px] text-black/60">
                Um marco novo vale para as entregas cadastradas a partir de agora e para as que ainda vão completar o
                prazo; clientes antigos que já passaram dele não entram de uma vez na lista.
            </p>
            <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <FormularioMarco
                    marcoEmEdicao={marcoEmEdicao}
                    aoSalvar={aoSalvarMarco}
                    aoCancelarEdicao={() => definirMarcoEmEdicao(null)}
                />
                <TabelaMarcos
                    marcos={marcos}
                    carregando={carregando}
                    marcoEmAcao={marcoEmAcao}
                    aoEditar={definirMarcoEmEdicao}
                    aoAlternarAtivo={aoAlternarAtivo}
                    aoExcluir={aoExcluirMarco}
                />
            </div>
        </div>
    );
}
