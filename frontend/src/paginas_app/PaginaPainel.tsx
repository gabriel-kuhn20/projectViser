import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obterResumoPendencias, type ResumoPendenciasApi } from "../servicos_api/ApiPainel";
import { rotulosTipoMarco, tiposMarcoDisponiveis } from "../tipos_compartilhados/TiposDominio";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

// UC11 · Ver painel de pendências por marco (RF11)
export function PaginaPainel() {
  const [resumoPendencias, definirResumoPendencias] = useState<ResumoPendenciasApi | null>(null);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);

  useEffect(() => {
    obterResumoPendencias()
        .then(definirResumoPendencias)
        .catch((erroRequisicao) =>
            definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível carregar o painel."))
        );
  }, []);

  return (
      <div>
        <h2 className="pagina-titulo">Painel</h2>
        <p className="text-sm text-viser-900/70 mb-6">
          Clientes aguardando o contato de acompanhamento em cada marco.
        </p>

        {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {tiposMarcoDisponiveis.map((tipoMarcoCartao) => {
            const totalPendentes = resumoPendencias?.[tipoMarcoCartao] ?? 0;
            return (
                // o cartão leva para a tela de lembretes já na aba daquele marco
                <Link
                    key={tipoMarcoCartao}
                    to={`/?marco=${tipoMarcoCartao}`}
                    className="cartao block transition-colors hover:border-viser-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-viser-700"
                >
                  <span className="text-sm font-medium text-viser-900/70">{rotulosTipoMarco[tipoMarcoCartao]}</span>
                    <span className="mt-2 block font-display text-5xl lining-nums tabular-nums text-viser-950">
                    {resumoPendencias ? totalPendentes : "–"}
                  </span>
                  <span className="mt-1 block text-sm text-viser-900/70">
                    {totalPendentes === 1 ? "cliente aguardando contato" : "clientes aguardando contato"}
                  </span>
                  <span className="mt-4 block text-sm font-medium text-viser-800">Ver lista</span>
                </Link>
            );
          })}
        </div>
      </div>
  );
}