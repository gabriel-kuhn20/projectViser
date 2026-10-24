import { useCallback, useEffect, useState } from "react";
import { FormularioAtendente } from "../componentes_pessoas/FormularioAtendente";
import { TabelaAtendentes } from "../componentes_pessoas/TabelaAtendentes";
import { excluirAtendente, listarAtendentes, type AtendenteApi } from "../servicos_api/ApiAtendente";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";
import { TituloPagina } from "../componentes_layout/TituloPagina";

// UC10 · Cadastrar conta de atendente (RF09) + listagem, edição de papel e exclusão (só administrador)
export function PaginaAtendentes() {
    const [atendentes, definirAtendentes] = useState<AtendenteApi[]>([]);
    const [carregando, definirCarregando] = useState(true);
    const [atendenteEmEdicao, definirAtendenteEmEdicao] = useState<AtendenteApi | null>(null);
    const [mensagemErro, definirMensagemErro] = useState<string | null>(null);

    // a lista é recarregada depois de salvar: o cadastro não devolve a conta completa
    const carregarAtendentes = useCallback(async () => {
        try {
            definirAtendentes(await listarAtendentes());
        } catch (erro) {
            definirMensagemErro(formatarMensagemErro(erro, "não foi possível carregar as contas."));
        } finally {
            definirCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarAtendentes();
    }, [carregarAtendentes]);

    function aoSalvarAtendente() {
        definirAtendenteEmEdicao(null);
        carregarAtendentes();
    }

    async function aoExcluirAtendente(atendente: AtendenteApi) {
        const confirmou = window.confirm(`Excluir a conta de "${atendente.pessoa.nome}"? Essa ação não pode ser desfeita.`);
        if (!confirmou) return;

        definirMensagemErro(null);
        try {
            await excluirAtendente(atendente.id);
            definirAtendentes((atuais) => atuais.filter((a) => a.id !== atendente.id));
            if (atendenteEmEdicao?.id === atendente.id) definirAtendenteEmEdicao(null);
        } catch (erro) {
            // o servidor recusa excluir a própria conta, o último administrador e contas com histórico
            definirMensagemErro(formatarMensagemErro(erro, "não foi possível excluir a conta."));
        }
    }

    return (
        <div>
            <TituloPagina titulo="Atendentes" subtitulo="Contas da equipe que acessam o sistema de pós-venda." />
            {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}
            <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <FormularioAtendente
                    atendenteEmEdicao={atendenteEmEdicao}
                    aoSalvar={aoSalvarAtendente}
                    aoCancelarEdicao={() => definirAtendenteEmEdicao(null)}
                />
                <TabelaAtendentes
                    atendentes={atendentes}
                    carregando={carregando}
                    aoEditar={definirAtendenteEmEdicao}
                    aoExcluir={aoExcluirAtendente}
                />
            </div>
        </div>
    );
}
