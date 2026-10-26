import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obterPainel, type LembretePainelApi, type PainelApi } from "../servicos_api/ApiPainel";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";
import { calcularDiasAguardando, formatarDiasAguardando } from "../utilitarios_formatacao/FormatarData";
import { formatarTelefone } from "../utilitarios_formatacao/FormatarTelefone";
import { TituloPagina } from "../componentes_layout/TituloPagina";
import { IconeSetaDireita } from "../componentes_site/IconesSite";

function formatarPlural(quantidade: number, singular: string, plural: string) {
  return quantidade === 1 ? singular : plural;
}

// linha "Ana · Armação Ray-Ban · (51) 99999-0000" usada no próximo cliente e nos meus atendimentos
function descreverLembrete(lembretePainel: LembretePainelApi) {
  const { entrega } = lembretePainel.marco;
  return `${entrega.produto} · ${formatarTelefone(entrega.cliente.contato)}`;
}

// UC09 · Ver painel de pendências (RF10, RF19): a tela inicial responde "o que faço agora"
export function PaginaPainel() {
  const { papelAcesso } = usarAutenticacao();
  const [painel, definirPainel] = useState<PainelApi | null>(null);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarPainel() {
      try {
        definirPainel(await obterPainel());
      } catch (erroRequisicao) {
        definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível carregar o painel."));
      }
    }
    carregarPainel();
  }, []);

  if (mensagemErro) {
    return (
        <div>
          <TituloPagina titulo="Painel" />
          <p role="alert" className="mensagem-erro">{mensagemErro}</p>
        </div>
    );
  }

  if (!painel) {
    return (
        <div>
          <TituloPagina titulo="Painel" />
          <div className="cartao mensagem-vazia">carregando painel...</div>
        </div>
    );
  }

  const { marcos, meusAtendimentos, proximoCliente, contatos } = painel;

  return (
      <div>
        <TituloPagina titulo="Painel" subtitulo="O que precisa de atenção no pós-venda agora." />

        {/* 3. por onde começar: quem espera há mais tempo e ninguém assumiu */}
        <section className="cartao-escuro mb-8 flex flex-wrap items-center justify-between gap-5 p-7">
          {proximoCliente ? (
              <>
                <div className="min-w-0">
                  <p className="font-comfortaa text-[15px] text-white/70">Próximo cliente</p>
                  <p className="mt-1 text-[24px] font-bold leading-tight">
                    {proximoCliente.marco.entrega.cliente.pessoa.nome}
                  </p>
                  <p className="mt-1 text-[14px] text-white/70">
                    {descreverLembrete(proximoCliente)} · marco de {proximoCliente.marco.tipoMarco.nome},{" "}
                    {formatarDiasAguardando(calcularDiasAguardando(proximoCliente.marco.dataAlvo))}
                  </p>
                </div>
                <Link
                    to={`/lembretes?marco=${proximoCliente.marco.tipoMarco.id}&lembrete=${proximoCliente.id}`}
                    className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-2.5 font-sans text-[12px] font-semibold uppercase tracking-[0.02em] text-black transition-colors hover:bg-site-cabecalho"
                >
                  Abrir lembrete
                  <IconeSetaDireita className="h-4 w-4" />
                </Link>
              </>
          ) : (
              <p className="font-comfortaa text-[16px]">Nenhum cliente esperando contato. Tudo em dia!</p>
          )}
        </section>

        {/* 1. pendentes e atrasados de cada marco ativo — os marcos vêm do cadastro do administrador */}
        <h2 className="secao-titulo mb-4">Pendências por marco</h2>
        {marcos.length === 0 && (
            <div className="cartao mensagem-vazia mb-8">nenhum marco ativo cadastrado.</div>
        )}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {marcos.map((marcoPainel) => (
              <Link
                  key={marcoPainel.id}
                  to={`/lembretes?marco=${marcoPainel.id}`}
                  className="cartao group flex flex-col transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                <span className="font-comfortaa text-[16px] text-black/70">{marcoPainel.nome}</span>
                <span className="mt-3 block text-[48px] font-bold leading-none tabular-nums">{marcoPainel.pendentes}</span>
                <span className="mt-2 block text-[14px] text-black/60">
                  {formatarPlural(marcoPainel.pendentes, "cliente aguardando contato", "clientes aguardando contato")}
                </span>
                <span className="mt-4 flex flex-wrap items-center gap-2">
                  {marcoPainel.atrasados > 0 && (
                      <span className="etiqueta etiqueta-alerta">
                        {marcoPainel.atrasados} há mais de 7 dias
                      </span>
                  )}
                  <span className="botao-link ml-auto">Ver lista</span>
                </span>
              </Link>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* 2. o que ficou comigo: assumido e ainda não concluído */}
          <section className="cartao min-w-0">
            <h2 className="secao-titulo mb-4">Continuar meus atendimentos</h2>
            {meusAtendimentos.length === 0 && (
                <p className="mensagem-vazia">você não tem atendimentos em aberto.</p>
            )}
            <ul className="flex flex-col divide-y divide-black/10">
              {meusAtendimentos.map(({ lembrete, iniciadoEm }) => (
                  <li key={lembrete.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="font-semibold">{lembrete.marco.entrega.cliente.pessoa.nome}</p>
                      <p className="text-[13px] text-black/60">
                        {descreverLembrete(lembrete)} · {lembrete.marco.tipoMarco.nome} · assumido em{" "}
                        {new Date(iniciadoEm).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Link
                        to={`/lembretes?marco=${lembrete.marco.tipoMarco.id}&concluir=${lembrete.id}`}
                        className="botao-secundario"
                    >
                      Concluir
                    </Link>
                  </li>
              ))}
            </ul>
          </section>

          {/* 5. contatos registrados: o atendente vê os seus; o administrador vê a equipe */}
          <section className="cartao min-w-0">
            <h2 className="secao-titulo mb-4">
              {papelAcesso === "admin" ? "Contatos da equipe" : "Meus contatos"}
            </h2>
            <dl className="mb-5 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-[13px] text-black/55">Hoje</dt>
                <dd className="text-[36px] font-bold leading-none tabular-nums">{contatos.hoje}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-black/55">Últimos 7 dias</dt>
                <dd className="text-[36px] font-bold leading-none tabular-nums">{contatos.semana}</dd>
              </div>
            </dl>
            {contatos.porAtendente.length > 0 && (
                <div className="tabela-wrapper">
                  <table className="tabela">
                    <thead>
                    <tr>
                      <th>Atendente</th>
                      <th className="text-right">Hoje</th>
                      <th className="text-right">7 dias</th>
                    </tr>
                    </thead>
                    <tbody>
                    {contatos.porAtendente.map((contatosAtendente) => (
                        <tr key={contatosAtendente.usuarioId}>
                          <td>{contatosAtendente.nome}</td>
                          <td className="text-right tabular-nums">{contatosAtendente.hoje}</td>
                          <td className="text-right tabular-nums">{contatosAtendente.semana}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            )}
          </section>
        </div>
      </div>
  );
}
