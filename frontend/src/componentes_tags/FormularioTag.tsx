import { useEffect, useState } from "react";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { cadastrarTag, editarTag, DadosTag } from "../servicos_api/ApiTag";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

type PropriedadesFormularioTag = {
    tagEmEdicao: DadosTag | null;
    aoSalvar: () => void;
    aoCancelar: () => void;
};

// Cadastrar tag / Editar tag
export function FormularioTag({ tagEmEdicao, aoSalvar, aoCancelar }: PropriedadesFormularioTag) {
    const [nomeTag, definirNomeTag] = useState("");
    const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
    const [estaEnviando, definirEstaEnviando] = useState(false);

    // preenche o campo ao entrar em modo de edição e limpa ao sair
    useEffect(() => {
        definirNomeTag(tagEmEdicao?.nome ?? "");
        definirMensagemErro(null);
    }, [tagEmEdicao]);

    async function enviarFormulario(evento: React.FormEvent) {
        evento.preventDefault();
        definirMensagemErro(null);
        definirEstaEnviando(true);

        try {
            if (tagEmEdicao) {
                await editarTag(tagEmEdicao.id, nomeTag);
            } else {
                await cadastrarTag(nomeTag);
            }
            definirNomeTag("");
            aoSalvar();
        } catch (erro) {
            definirMensagemErro(formatarMensagemErro(erro, "não foi possível salvar a tag"));
        } finally {
            definirEstaEnviando(false);
        }
    }

    return (
        <form onSubmit={enviarFormulario} className="card card-body mb-4" style={{ maxWidth: 480 }}>
            <h2 className="h5 mb-3">{tagEmEdicao ? "Editar tag" : "Nova tag"}</h2>
            <CampoTexto rotulo="Nome da tag" valor={nomeTag} aoAlterar={definirNomeTag} obrigatorio />
            {mensagemErro && <div className="alert alert-danger" role="alert">{mensagemErro}</div>}
            <div className="d-flex gap-2">
                <BotaoPrimario
                    tipo="submit"
                    texto={estaEnviando ? "Salvando..." : tagEmEdicao ? "Salvar alterações" : "Cadastrar"}
                    desabilitado={estaEnviando}
                />
                {tagEmEdicao && <BotaoPrimario texto="Cancelar" variante="secondary" aoClicar={aoCancelar} />}
            </div>
        </form>
    );
}