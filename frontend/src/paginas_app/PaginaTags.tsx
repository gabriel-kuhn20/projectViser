import { useEffect, useState } from "react";
import { FormularioTag } from "../componentes_tags/FormularioTag";
import { TabelaTags } from "../componentes_tags/TabelaTags";
import { excluirTag, listarTags, type TagApi } from "../servicos_api/ApiTag";

// CRUD de tags usadas para classificar clientes
export function PaginaTags() {
  const [tags, definirTags] = useState<TagApi[]>([]);
  const [carregando, definirCarregando] = useState(true);
  const [tagEmEdicao, definirTagEmEdicao] = useState<TagApi | null>(null);

  useEffect(() => {
    listarTags()
      .then(definirTags)
      .catch(() => definirTags([]))
      .finally(() => definirCarregando(false));
  }, []);

  function aoSalvarTag(tag: TagApi) {
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

    await excluirTag(tag.id);
    definirTags((atuais) => atuais.filter((t) => t.id !== tag.id));
    if (tagEmEdicao?.id === tag.id) definirTagEmEdicao(null);
  }

  return (
    <div>
      <h2 className="pagina-titulo">Tags</h2>
      <FormularioTag
        tagEmEdicao={tagEmEdicao}
        aoSalvar={aoSalvarTag}
        aoCancelarEdicao={() => definirTagEmEdicao(null)}
      />
      <TabelaTags tags={tags} carregando={carregando} aoEditar={definirTagEmEdicao} aoExcluir={aoExcluirTag} />
    </div>
  );
}
