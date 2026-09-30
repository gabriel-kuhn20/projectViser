import { useEffect, useState } from "react";
import { FormularioTag } from "../componentes_tags/FormularioTag";
import { TabelaTags } from "../componentes_tags/TabelaTags";
import { DadosTag, excluirTag, listarTags } from "../servicos_api/ApiTag";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

// CRUD de tags: cadastrar, listar, editar e excluir
export function PaginaTags() {
    const [tagsCadastradas, definirTagsCadastradas] = useState<DadosTag[]>([]);
    const [tagEmEdicao, definirTagEmEdicao] = useState<DadosTag | null>(null);
    const [mensagemErro, definirMensagemErro] = useState<string | null>(null);

    async function carregarTags() {
        try {
            definirTagsCadastradas(await listarTags());
            definirMensagemErro(null);
        } catch (erro) {
            definirMensagemErro(formatarMensagemErro(erro, "não foi possível carregar as tags"));
        }
    }

    useEffect(() => {
        carregarTags();
    }, []);

    async function excluirTagSelecionada(tag: DadosTag) {
        const confirmado = window.confirm(
            `Excluir a tag "${tag.nome}"? Os vínculos dela com clientes também serão removidos.`
        );
        if (!confirmado) return;

        try {
            await excluirTag(tag.id);
            if (tagEmEdicao?.id === tag.id) definirTagEmEdicao(null);
            await carregarTags();
        } catch (erro) {
            definirMensagemErro(formatarMensagemErro(erro, "não foi possível excluir a tag"));
        }
    }

    function finalizarEdicao() {
        definirTagEmEdicao(null);
        carregarTags();
    }

    return (
        <div>
            <h1 className="h3 mb-4">Tags</h1>
            <FormularioTag
                tagEmEdicao={tagEmEdicao}
                aoSalvar={finalizarEdicao}
                aoCancelar={() => definirTagEmEdicao(null)}
            />
            {mensagemErro && <div className="alert alert-danger" role="alert">{mensagemErro}</div>}
            <TabelaTags
                tagsCadastradas={tagsCadastradas}
                aoEditar={definirTagEmEdicao}
                aoExcluir={excluirTagSelecionada}
            />
        </div>
    );
}