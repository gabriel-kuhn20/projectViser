import { type InteracaoApi } from "../servicos_api/ApiInteracao";
import { rotulosTipoMarco } from "../tipos_compartilhados/TiposDominio";

type PropriedadesHistoricoInteracoes = {
  interacoesCliente: InteracaoApi[];
  estaCarregando: boolean;
};

function formatarDataHora(dataCompleta: string) {
  return new Date(dataCompleta).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// UC06 · Consultar histórico do cliente (RF06)
export function HistoricoInteracoes({ interacoesCliente, estaCarregando }: PropriedadesHistoricoInteracoes) {
  if (estaCarregando && interacoesCliente.length === 0) {
    return <div className="cartao mensagem-vazia">carregando histórico...</div>;
  }

  if (interacoesCliente.length === 0) {
    return <div className="cartao mensagem-vazia">nenhum contato registrado com este cliente ainda.</div>;
  }

  return (
      <ol className="cartao p-0 divide-y divide-viser-creme2">
        {interacoesCliente.map((interacaoCliente) => (
            <li key={interacaoCliente.id} className="px-6 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span className="font-medium text-viser-950">{interacaoCliente.usuario.pessoa.nome}</span>
                <span className="text-viser-900/60">
              <time dateTime={interacaoCliente.criadoEm}>{formatarDataHora(interacaoCliente.criadoEm)}</time>
                  {", "}contato de {rotulosTipoMarco[interacaoCliente.lembrete.marco.tipoMarco.nome]}
            </span>
              </div>
              <p className="mt-2 text-sm text-viser-900 whitespace-pre-line">{interacaoCliente.conteudo}</p>
              {interacaoCliente.respostaCliente && (
                  <p className="mt-2 text-sm text-viser-900/80 whitespace-pre-line">
                    <span className="font-medium">Resposta do cliente:</span> {interacaoCliente.respostaCliente}
                  </p>
              )}
            </li>
        ))}
      </ol>
  );
}