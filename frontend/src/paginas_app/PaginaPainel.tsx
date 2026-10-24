import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obterResumoPendencias, type ResumoPendenciasApi } from "../servicos_api/ApiPainel";
import { rotulosTipoMarco, tiposMarcoDisponiveis } from "../tipos_compartilhados/TiposDominio";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";
import { TituloPagina } from "../componentes_layout/TituloPagina";
import { IconeSetaDireita } from "../componentes_site/IconesSite";

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
        <TituloPagina titulo="Painel" subtitulo="Clientes aguardando o contato de acompanhamento em cada marco." />

        {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {tiposMarcoDisponiveis.map((tipoMarcoCartao) => {
            const totalPendentes = resumoPendencias?.[tipoMarcoCartao] ?? 0;
            return (
                // o cartão leva para a tela de lembretes já na aba daquele marco
                <Link
                    key={tipoMarcoCartao}
                    to={`/lembretes?marco=${tipoMarcoCartao}`}
                    className="cartao-escuro group flex flex-col p-8 transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                >
                  <span className="font-comfortaa text-[18px]">{rotulosTipoMarco[tipoMarcoCartao]}</span>
                  <span className="mt-6 block text-[64px] font-bold leading-none tabular-nums">
                    {resumoPendencias ? totalPendentes : "–"}
                  </span>
                  <span className="mt-3 block text-[14px] text-white/70">
                    {totalPendentes === 1 ? "cliente aguardando contato" : "clientes aguardando contato"}
                  </span>
                  <span className="mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-white px-5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[0.02em] text-black transition-colors group-hover:bg-site-cabecalho">
                    Ver lista
                    <IconeSetaDireita className="h-4 w-4" />
                  </span>
                </Link>
            );
          })}
        </div>
      </div>
  );
}
