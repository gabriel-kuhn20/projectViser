import { type TipoMarcoApi } from "../servicos_api/ApiTipoMarco";

type PropriedadesSelecaoMarcosEntrega = {
  tiposMarcoAtivos: TipoMarcoApi[];
  tiposMarcoMarcados: number[];
  aoAlterar: (tiposMarcoMarcados: number[]) => void;
};

// a API guarda os ignorados (marco criado depois pelo admin vale para a compra); a tela trabalha
// com os marcados, que é como a atendente pensa
export function calcularTiposMarcoIgnorados(tiposMarcoAtivos: TipoMarcoApi[], tiposMarcoMarcados: number[]) {
  return tiposMarcoAtivos
      .map((tipoMarco) => tipoMarco.id)
      .filter((tipoMarcoId) => !tiposMarcoMarcados.includes(tipoMarcoId));
}

// UC02 · Manter cliente (RF02) / UC03 A3: a atendente escolhe quais contatos a compra recebe
// (ex: óculos de sol só com o de 7 dias). Começa em branco para a escolha ser consciente
export function SelecaoMarcosEntrega({ tiposMarcoAtivos, tiposMarcoMarcados, aoAlterar }: PropriedadesSelecaoMarcosEntrega) {
  function alternarMarco(tipoMarcoId: number) {
    if (tiposMarcoMarcados.includes(tipoMarcoId)) {
      aoAlterar(tiposMarcoMarcados.filter((idMarcado) => idMarcado !== tipoMarcoId));
      return;
    }
    aoAlterar([...tiposMarcoMarcados, tipoMarcoId]);
  }

  if (tiposMarcoAtivos.length === 0) return null;

  return (
      // div com role="group": o <legend> precisa ser filho direto do fieldset e aqui divide a linha com os atalhos
      <div role="group" aria-label="Lembretes desta compra" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="campo-texto-rotulo">Lembretes desta compra</span>
          <div className="flex gap-3 text-[12px] font-semibold">
            <button
                type="button"
                className="underline underline-offset-2"
                onClick={() => aoAlterar(tiposMarcoAtivos.map((tipoMarco) => tipoMarco.id))}
            >
              Marcar todos
            </button>
            <button type="button" className="text-black/60 underline underline-offset-2" onClick={() => aoAlterar([])}>
              Limpar
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {tiposMarcoAtivos.map((tipoMarco) => (
              <label key={tipoMarco.id} className="inline-flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={tiposMarcoMarcados.includes(tipoMarco.id)}
                    onChange={() => alternarMarco(tipoMarco.id)}
                    className="h-4 w-4 accent-black"
                />
                {tipoMarco.nome}
              </label>
          ))}
        </div>
      </div>
  );
}
