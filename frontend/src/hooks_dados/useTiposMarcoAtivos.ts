import { useEffect, useState } from "react";
import { listarTiposMarco, type TipoMarcoApi } from "../servicos_api/ApiTipoMarco";

// marcos ativos cadastrados pelo administrador, usados na escolha de lembretes de cada compra.
// O prefixo "use" do arquivo segue a mesma exceção explicada em useAutenticacao.ts
export function usarTiposMarcoAtivos() {
  const [tiposMarcoAtivos, definirTiposMarcoAtivos] = useState<TipoMarcoApi[]>([]);

  useEffect(() => {
    async function carregarTiposMarco() {
      try {
        const tiposMarco = await listarTiposMarco();
        definirTiposMarcoAtivos(tiposMarco.filter((tipoMarco) => tipoMarco.ativo));
      } catch {
        // sem a lista a escolha some e a compra é salva com todos os marcos, como era antes
        definirTiposMarcoAtivos([]);
      }
    }
    carregarTiposMarco();
  }, []);

  return tiposMarcoAtivos;
}
