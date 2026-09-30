// UC05 · Ver lista de lembretes por marco (tela do dia a dia da atendente)
import { ListaLembretes } from "../componentes_lembretes/ListaLembretes";

export function PaginaLembretes() {
  return (
    <div>
      <h2 className="pagina-titulo">Lembretes</h2>
      <ListaLembretes />
    </div>
  );
}
