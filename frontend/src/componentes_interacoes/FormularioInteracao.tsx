import { useState } from "react";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { concluirLembrete, type LembreteApi, type TentativaContatoApi } from "../servicos_api/ApiLembrete";
import { registrarInteracao, type InteracaoApi } from "../servicos_api/ApiInteracao";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";
import { EdicaoInteracao, MarcaEditado } from "./EdicaoInteracao";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";
import { formatarTelefone } from "../utilitarios_formatacao/FormatarTelefone";

type PropriedadesFormularioInteracao = {
  lembreteSelecionado: LembreteApi;
  aoRegistrar: (lembreteAtualizado: LembreteApi) => void;
  aoConcluir: (lembreteConcluido: LembreteApi) => void;
  aoCancelar: () => void;
};

const camposIniciais = { conteudo: "", respostaCliente: "" };

// UC07 · Concluir lembrete de contato (RF07, RF17): o cliente nem sempre atende na primeira ligação,
// então cada tentativa pode ser registrada sem concluir; quem decide encerrar é a atendente.
// A1: sem nenhuma conversa registrada (agora ou antes), não conclui
export function FormularioInteracao({
                                      lembreteSelecionado,
                                      aoRegistrar,
                                      aoConcluir,
                                      aoCancelar,
                                    }: PropriedadesFormularioInteracao) {
  const [camposFormulario, definirCamposFormulario] = useState(camposIniciais);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [estaEnviando, definirEstaEnviando] = useState(false);
  // cópia local: corrigir uma tentativa atualiza só ela, sem fechar o formulário nem recarregar a lista
  const [tentativasAnteriores, definirTentativasAnteriores] = useState(lembreteSelecionado.interacoes);
  const [tentativaEmEdicaoId, definirTentativaEmEdicaoId] = useState<number | null>(null);
  const { papelAcesso, usuarioId } = usarAutenticacao();

  const entregaLembrete = lembreteSelecionado.marco.entrega;
  const possuiTentativas = tentativasAnteriores.length > 0;
  const conteudoDigitado = camposFormulario.conteudo.trim();
  // a API rejeita string vazia, então a resposta só vai se foi preenchida
  const respostaDigitada = camposFormulario.respostaCliente.trim() || undefined;

  // mesma regra da API: só quem registrou ou um admin corrige (o lembrete aqui é sempre pendente)
  function verificarPodeEditar(tentativa: TentativaContatoApi) {
    return papelAcesso === "admin" || tentativa.usuarioId === usuarioId;
  }

  function aoSalvarEdicao(interacaoEditada: InteracaoApi) {
    definirTentativasAnteriores((tentativasAtuais) =>
        tentativasAtuais.map((tentativa) =>
            tentativa.id === interacaoEditada.id
                ? {
                  ...tentativa,
                  conteudo: interacaoEditada.conteudo,
                  respostaCliente: interacaoEditada.respostaCliente,
                  editadoEm: interacaoEditada.editadoEm,
                }
                : tentativa,
        ),
    );
    definirTentativaEmEdicaoId(null);
  }

  async function registrarSemConcluir() {
    definirMensagemErro(null);
    if (!conteudoDigitado) {
      definirMensagemErro("descreva o que aconteceu nesta tentativa antes de registrar.");
      return;
    }

    definirEstaEnviando(true);
    try {
      await registrarInteracao({
        lembreteId: lembreteSelecionado.id,
        conteudo: conteudoDigitado,
        respostaCliente: respostaDigitada,
      });
      aoRegistrar(lembreteSelecionado);
    } catch (erroRequisicao) {
      definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível registrar o contato. tente novamente."));
    } finally {
      definirEstaEnviando(false);
    }
  }

  async function concluirContato(eventoEnvio: React.FormEvent) {
    eventoEnvio.preventDefault();
    // concluir tira o cliente da lista e só o administrador desfaz (UC07 A3): confirma antes
    const confirmouConclusao = window.confirm(
        `Deseja concluir o contato com ${entregaLembrete.cliente.pessoa.nome}? ` +
        "Depois de concluído, só um administrador pode reabrir o lembrete.",
    );
    if (!confirmouConclusao) return;

    definirMensagemErro(null);
    definirEstaEnviando(true);

    try {
      // campo vazio com tentativas anteriores: conclui com o que já foi registrado
      await concluirLembrete(lembreteSelecionado.id, {
        conteudo: conteudoDigitado || undefined,
        respostaCliente: conteudoDigitado ? respostaDigitada : undefined,
      });
      aoConcluir(lembreteSelecionado);
    } catch (erroRequisicao) {
      definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível concluir o contato. tente novamente."));
    } finally {
      definirEstaEnviando(false);
    }
  }

  return (
      <form onSubmit={concluirContato} className="cartao mb-8 flex flex-col gap-5">
        <div>
          <h3 className="secao-titulo">Contato com {entregaLembrete.cliente.pessoa.nome}</h3>
          <p className="mt-1 text-[14px] text-black/60">
            {entregaLembrete.produto} · {formatarTelefone(entregaLembrete.cliente.contato)}
          </p>
        </div>

        {possuiTentativas && (
            <div>
              <p className="campo-texto-rotulo mb-2">Tentativas registradas</p>
              <ol className="flex flex-col divide-y divide-black/10 rounded-xl border border-black/10 text-[14px]">
                {tentativasAnteriores.map((tentativa) => (
                    <li key={tentativa.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="flex flex-wrap gap-1 text-[12px] text-black/55">
                          {new Date(tentativa.criadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                          {" · "}
                          {tentativa.usuario.pessoa.nome}
                          <MarcaEditado editadoEm={tentativa.editadoEm} />
                        </p>
                        {verificarPodeEditar(tentativa) && tentativa.id !== tentativaEmEdicaoId && (
                            <button
                                type="button"
                                className="text-[12px] font-semibold underline underline-offset-2"
                                onClick={() => definirTentativaEmEdicaoId(tentativa.id)}
                                disabled={estaEnviando}
                            >
                              Editar
                            </button>
                        )}
                      </div>
                      {tentativa.id === tentativaEmEdicaoId && (
                          <EdicaoInteracao
                              interacaoEmEdicao={tentativa}
                              aoSalvar={aoSalvarEdicao}
                              aoCancelar={() => definirTentativaEmEdicaoId(null)}
                          />
                      )}
                      {tentativa.id !== tentativaEmEdicaoId && (
                          <>
                            <p className="mt-1">{tentativa.conteudo}</p>
                            {tentativa.respostaCliente && (
                                <p className="mt-1 text-black/60">Cliente: {tentativa.respostaCliente}</p>
                            )}
                          </>
                      )}
                    </li>
                ))}
              </ol>
            </div>
        )}

        {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}

        <label className="campo-texto-rotulo">
          {possuiTentativas ? "Nova tentativa (opcional para concluir)" : "O que foi conversado"}
          <textarea
              value={camposFormulario.conteudo}
              required={!possuiTentativas}
              rows={3}
              placeholder="ex.: não atendeu, pediu para ligar depois, está satisfeito com a armação..."
              onChange={(eventoCampo) =>
                  definirCamposFormulario((camposAtuais) => ({ ...camposAtuais, conteudo: eventoCampo.target.value }))
              }
              className="campo-texto-input resize-y leading-relaxed"
          />
        </label>

        <CampoTexto
            rotulo="Resposta do cliente (opcional)"
            valor={camposFormulario.respostaCliente}
            aoAlterar={(valorDigitado) =>
                definirCamposFormulario((camposAtuais) => ({ ...camposAtuais, respostaCliente: valorDigitado }))
            }
        />

        <div className="formulario-acoes">
          <BotaoPrimario texto={estaEnviando ? "Salvando..." : "Concluir contato"} desabilitado={estaEnviando} />
          <button type="button" className="botao-secundario" onClick={registrarSemConcluir} disabled={estaEnviando}>
            Registrar sem concluir
          </button>
          <button type="button" className="botao-link" onClick={aoCancelar} disabled={estaEnviando}>
            Cancelar
          </button>
        </div>
      </form>
  );
}
