import { useEffect, useState } from "react";
import { listarTiposMarco, type TipoMarcoApi } from "../servicos_api/ApiTipoMarco";

type PropriedadesSelecaoMarcosEntrega = {
  tiposMarcoIgnorados: number[];
  aoAlterar: (tiposMarcoIgnorados: number[]) => void;
};

// UC04 · Calcular marcos de acompanhamento (RF03): a atendente escolhe quais contatos a compra recebe
// (ex: óculos de sol só com o de 7 dias). Começa tudo marcado, que é o comportamento padrão
export function SelecaoMarcosEntrega({ tiposMarcoIgnorados, aoAlterar }: PropriedadesSelecaoMarcosEntrega) {
  const [tiposMarcoAtivos, definirTiposMarcoAtivos] = useState<TipoMarcoApi[]>([]);

  useEffect(() => {
    async function carregarTiposMarco() {
      try {
        const tiposMarco = await listarTiposMarco();
        definirTiposMarcoAtivos(tiposMarco.filter((tipoMarco) => tipoMarco.ativo));
      } catch {
        // sem a lista a compra é salva com todos os marcos, como era antes da escolha existir
        definirTiposMarcoAtivos([]);
      }
    }
    carregarTiposMarco();
  }, []);

  function alternarMarco(tipoMarcoId: number) {
    if (tiposMarcoIgnorados.includes(tipoMarcoId)) {
      aoAlterar(tiposMarcoIgnorados.filter((idIgnorado) => idIgnorado !== tipoMarcoId));
      return;
    }
    aoAlterar([...tiposMarcoIgnorados, tipoMarcoId]);
  }

  if (tiposMarcoAtivos.length === 0) return null;

  return (
      <fieldset className="flex flex-col gap-2">
        <legend className="campo-texto-rotulo mb-2">Lembretes desta compra</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {tiposMarcoAtivos.map((tipoMarco) => (
              <label key={tipoMarco.id} className="inline-flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={!tiposMarcoIgnorados.includes(tipoMarco.id)}
                    onChange={() => alternarMarco(tipoMarco.id)}
                    className="h-4 w-4 accent-black"
                />
                {tipoMarco.nome}
              </label>
          ))}
        </div>
      </fieldset>
  );
}
