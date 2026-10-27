import { useEffect, useState } from "react";
import { FormularioTag } from "../componentes_tags/FormularioTag";
import { TabelaTags } from "../componentes_tags/TabelaTags";
import { excluirTag, listarTags, type TagApi } from "../servicos_api/ApiTag";
import { TituloPagina } from "../componentes_layout/TituloPagina";
import { CampoBusca } from "../componentes_compartilhados/CampoBusca";
import { correspondeBusca } from "../utilitarios_formatacao/BuscarTexto";

// UC11 · Manter tag (RF12, RF15)
export function PaginaTags() {
    const [tags, definirTags] = useState<TagApi[]>([]);
    const [carregando, definirCarregando] = useState(true);
    const [tagEmEdicao, definirTagEmEdicao] = useState<TagApi | null>(null);
    const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
    const [mensagemSucesso, definirMensagemSucesso] = useState<string | null>(null);
    const [termoBusca, definirTermoBusca] = useState("");

    const tagsFiltradas = tags.filter((tag) => correspondeBusca(termoBusca, [tag.nome]));

    useEffect(() => {
        listarTags()
            .then(definirTags)
            .catch(() => definirMensagemErro("não foi possível carregar as tags."))
            .finally(() => definirCarregando(false));
    }, []);

    function aoSalvarTag(tag: TagApi) {
        const estavaEditando = tagEmEdicao !== null;
        definirMensagemErro(null);
        definirMensagemSucesso(estavaEditando ? `tag ${tag.nome} atualizada.` : `tag ${tag.nome} cadastrada.`);
        definirTags((atuais) => {
            const jaExiste = atuais.some((t) => t.id === tag.id);
            if (jaExiste) return atuais.map((t) => (t.id === tag.id ? tag : t));
            return [...atuais, tag].sort((a, b) => a.nome.localeCompare(b.nome));
        });
        definirTagEmEdicao(null);
    }

    async function aoExcluirTag(tag: TagApi) {
        const confirmou = window.confirm(`Excluir a tag "${tag.nome}"?`);
        if (!confirmou) return;

        definirMensagemErro(null);
        definirMensagemSucesso(null);
        try {
            await excluirTag(tag.id);
            definirMensagemSucesso(`tag ${tag.nome} excluída.`);
            definirTags((atuais) => atuais.filter((t) => t.id !== tag.id));
            if (tagEmEdicao?.id === tag.id) definirTagEmEdicao(null);
        } catch (erro: any) {
            definirMensagemErro(erro?.response?.data?.mensagem ?? "não foi possível excluir a tag.");
        }
    }

    return (
        <div>
            <TituloPagina titulo="Tags" subtitulo="Etiquetas para classificar as clientes." />
            {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}
            {mensagemSucesso && <p role="status" className="mensagem-sucesso">{mensagemSucesso}</p>}
            <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <FormularioTag
                    tagEmEdicao={tagEmEdicao}
                    aoSalvar={aoSalvarTag}
                    aoCancelarEdicao={() => definirTagEmEdicao(null)}
                />
                <div className="min-w-0">
                    <div className="mb-4">
                        <CampoBusca rotulo="Buscar tag" valor={termoBusca} aoAlterar={definirTermoBusca} />
                    </div>
                    <TabelaTags
                        tags={tagsFiltradas}
                        filtroAtivo={termoBusca.trim() !== ""}
                        carregando={carregando}
                        aoEditar={definirTagEmEdicao}
                        aoExcluir={aoExcluirTag}
                    />
                </div>
            </div>
        </div>
    );
}
