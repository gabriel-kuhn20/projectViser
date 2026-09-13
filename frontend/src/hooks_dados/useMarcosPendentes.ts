import { useEffect, useState } from "react";
import { listarLembretesPorMarco } from "../servicos_api/ApiLembrete";
import { TipoMarco } from "../tipos_compartilhados/TiposDominio";

export function usarMarcosPendentes(tipoMarco: TipoMarco) {
  const [lembretes, definirLembretes] = useState([]);

  useEffect(() => {
    listarLembretesPorMarco(tipoMarco).then(definirLembretes);
  }, [tipoMarco]);

  return lembretes;
}
