import { useEffect, useState } from "react";
import { listarTags, type TagApi, type VinculoTagApi } from "../servicos_api/ApiTag";

type PropriedadesFiltroTag = {
  tagIdSelecionada: number | null;
  aoSelecionar: (tagId: number | null) => void;
};

// filtro feito na própria tela: as listas de clientes e de lembretes já chegam com as tags
export function possuiTag(tagsCliente: VinculoTagApi[] | undefined, tagId: number | null) {
  if (tagId === null) return true;
  return (tagsCliente ?? []).some((vinculoTag) => vinculoTag.tag.id === tagId);
}

// UC11 · Manter tag (RF12): seleciona uma tag para ver só os clientes classificados com ela
export function FiltroTag({ tagIdSelecionada, aoSelecionar }: PropriedadesFiltroTag) {
  const [tagsDisponiveis, definirTagsDisponiveis] = useState<TagApi[]>([]);

  useEffect(() => {
    async function carregarTags() {
      try {
        definirTagsDisponiveis(await listarTags());
      } catch {
        // sem as tags o filtro só fica vazio; a lista da tela continua aparecendo inteira
        definirTagsDisponiveis([]);
      }
    }
    carregarTags();
  }, []);

  // sem tag cadastrada o filtro não tem o que oferecer
  if (tagsDisponiveis.length === 0) return null;

  return (
      <label className="campo-texto-rotulo mb-0 w-full sm:w-64">
        Filtrar por tag
        <select
            value={tagIdSelecionada ?? ""}
            onChange={(evento) => aoSelecionar(evento.target.value === "" ? null : Number(evento.target.value))}
            className="campo-texto-input"
        >
          <option value="">Todas as tags</option>
          {tagsDisponiveis.map((tagDisponivel) => (
              <option key={tagDisponivel.id} value={tagDisponivel.id}>
                {tagDisponivel.nome}
              </option>
          ))}
        </select>
      </label>
  );
}
