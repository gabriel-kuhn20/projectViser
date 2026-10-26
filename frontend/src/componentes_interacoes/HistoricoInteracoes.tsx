import { type InteracaoApi } from "../servicos_api/ApiInteracao";

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
      <div>
        <h2 className="secao-titulo mb-4">Contatos registrados</h2>
        <ol className="relative flex flex-col gap-4 border-l-2 border-black pl-6">
          {interacoesCliente.map((interacaoCliente) => (
              <li key={interacaoCliente.id} className="cartao relative">
                {/* ponto na linha do tempo, como em "3 anos de Viser" */}
                <span className="absolute -left-[31px] top-7 h-3 w-3 rounded-full bg-black" aria-hidden="true" />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-black">{interacaoCliente.usuario.pessoa.nome}</span>
                  <span className="flex items-center gap-2 text-[13px] text-black/55">
                    <span className="etiqueta">{interacaoCliente.lembrete.marco.tipoMarco.nome}</span>
                    <time dateTime={interacaoCliente.criadoEm}>{formatarDataHora(interacaoCliente.criadoEm)}</time>
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-black/85">{interacaoCliente.conteudo}</p>
                {interacaoCliente.respostaCliente && (
                    <p className="mt-3 whitespace-pre-line rounded-[10px] bg-app-fundo px-4 py-3 text-[14px] text-black/80">
                      <span className="font-semibold">Resposta da cliente:</span> {interacaoCliente.respostaCliente}
                    </p>
                )}
              </li>
          ))}
        </ol>
      </div>
  );
}
