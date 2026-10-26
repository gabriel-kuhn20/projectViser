import { type VinculoTagApi } from "../servicos_api/ApiTag";

type PropriedadesEtiquetasCliente = {
  tagsCliente: VinculoTagApi[] | undefined;
};

// UC11 · Manter tag (RF12): mostra as tags do cliente onde a atendente trabalha (lista de
// clientes e lembretes); sem tag não ocupa espaço na linha
export function EtiquetasCliente({ tagsCliente }: PropriedadesEtiquetasCliente) {
  if (!tagsCliente || tagsCliente.length === 0) return null;

  return (
      <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Tags do cliente">
        {tagsCliente.map((vinculoTag) => (
            <li key={vinculoTag.tag.id} className="etiqueta">
              {vinculoTag.tag.nome}
            </li>
        ))}
      </ul>
  );
}
