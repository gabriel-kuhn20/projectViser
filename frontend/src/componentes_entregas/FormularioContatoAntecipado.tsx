import { useState } from "react";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { type EntregaApi } from "../servicos_api/ApiCliente";
import { type TipoMarcoApi } from "../servicos_api/ApiTipoMarco";
import { anteciparLembrete } from "../servicos_api/ApiLembrete";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";
import { formatarDataSemHora } from "../utilitarios_formatacao/FormatarData";

type PropriedadesFormularioContatoAntecipado = {
  entregasCliente: EntregaApi[];
  tiposMarcoAtivos: TipoMarcoApi[];
  aoSalvar: (mensagemSucesso: string) => void;
  aoCancelar: () => void;
};

const UM_DIA_EM_MS = 24 * 60 * 60 * 1000;
const camposIniciais = { conteudo: "", respostaCliente: "" };

// o próximo contato é o marco ativo mais curto que ainda não gerou lembrete — inclusive um que
// já passou mas foi pulado por ter sido criado depois da entrega (verificarMarcoValeParaEntrega)
export function encontrarProximoMarco(entrega: EntregaApi, tiposMarcoAtivos: TipoMarcoApi[]) {
  const marcosGerados = entrega.marcos ?? [];
  const marcosIgnorados = entrega.tiposMarcoIgnorados ?? [];
  return tiposMarcoAtivos
      .filter((tipoMarco) => !marcosGerados.some((marco) => marco.tipoMarcoId === tipoMarco.id))
      // marco desmarcado no cadastro da compra não vira contato
      .filter((tipoMarco) => !marcosIgnorados.includes(tipoMarco.id))
      .sort((marcoA, marcoB) => marcoA.diasAposEntrega - marcoB.diasAposEntrega)[0];
}

function calcularDataMarco(dataEntrega: string, diasAposEntrega: number) {
  return new Date(new Date(dataEntrega).getTime() + diasAposEntrega * UM_DIA_EM_MS).toISOString();
}

// UC07 · Concluir lembrete de contato (RF07) — contato antecipado: o cliente ligou ou passou na loja
// antes do marco vencer. Nada é gravado até salvar, então cancelar não deixa lembrete pendurado
export function FormularioContatoAntecipado({
                                              entregasCliente,
                                              tiposMarcoAtivos,
                                              aoSalvar,
                                              aoCancelar,
                                            }: PropriedadesFormularioContatoAntecipado) {
  // só entra na escolha a entrega que ainda tem marco por vir
  const entregasComContato = entregasCliente.filter((entrega) => encontrarProximoMarco(entrega, tiposMarcoAtivos));
  // com uma entrega só não há o que escolher; com mais, começa em branco para a atendente
  // decidir de qual compra foi a conversa em vez de aceitar a primeira sem perceber
  const entregaUnica = entregasComContato.length === 1 ? entregasComContato[0].id : undefined;
  const [entregaSelecionadaId, definirEntregaSelecionadaId] = useState<number | undefined>(entregaUnica);
  const [camposFormulario, definirCamposFormulario] = useState(camposIniciais);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [estaEnviando, definirEstaEnviando] = useState(false);

  const entregaSelecionada = entregasComContato.find((entrega) => entrega.id === entregaSelecionadaId);
  const marcoSelecionado = entregaSelecionada && encontrarProximoMarco(entregaSelecionada, tiposMarcoAtivos);

  async function salvarContato(concluir: boolean) {
    definirMensagemErro(null);
    if (!entregaSelecionada || !marcoSelecionado) {
      definirMensagemErro("selecione de qual entrega foi o contato.");
      return;
    }

    const conteudoDigitado = camposFormulario.conteudo.trim();
    if (!conteudoDigitado) {
      definirMensagemErro("descreva o que foi conversado antes de salvar.");
      return;
    }

    definirEstaEnviando(true);
    try {
      await anteciparLembrete({
        entregaId: entregaSelecionada.id,
        tipoMarcoId: marcoSelecionado.id,
        conteudo: conteudoDigitado,
        // a API rejeita string vazia, então a resposta só vai se foi preenchida
        respostaCliente: camposFormulario.respostaCliente.trim() || undefined,
        concluir,
      });
      if (concluir) {
        aoSalvar(`contato de ${marcoSelecionado.nome} registrado e concluído.`);
        return;
      }
      aoSalvar(`contato de ${marcoSelecionado.nome} registrado; o lembrete fica pendente na tela de lembretes.`);
    } catch (erroRequisicao) {
      definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível registrar o contato. tente novamente."));
    } finally {
      definirEstaEnviando(false);
    }
  }

  function enviarFormulario(eventoEnvio: React.FormEvent) {
    eventoEnvio.preventDefault();
    salvarContato(true);
  }

  return (
      <form onSubmit={enviarFormulario} className="cartao mb-5 flex flex-col gap-5">
        <h3 className="secao-titulo">Registrar contato</h3>

        {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}

        {entregasComContato.length > 1 && (
            <label className="campo-texto-rotulo">
              Entrega
              <select
                  value={entregaSelecionadaId ?? ""}
                  required
                  onChange={(evento) => definirEntregaSelecionadaId(Number(evento.target.value))}
                  className="campo-texto-input"
              >
                <option value="" disabled>
                  Selecione a entrega
                </option>
                {entregasComContato.map((entrega) => (
                    <option key={entrega.id} value={entrega.id}>
                      {entrega.produto} · entregue em {formatarDataSemHora(entrega.dataEntrega)}
                    </option>
                ))}
              </select>
            </label>
        )}

        {/* deixa claro a qual lembrete o contato vai contar, já que ele ainda não apareceu na lista */}
        {entregaSelecionada && marcoSelecionado && (
            <p className="rounded-xl bg-black/5 px-4 py-3 text-[14px]">
              Conta como o contato de <strong>{marcoSelecionado.nome}</strong> de {entregaSelecionada.produto}, previsto
              para {formatarDataSemHora(calcularDataMarco(entregaSelecionada.dataEntrega, marcoSelecionado.diasAposEntrega))}.
            </p>
        )}

        <label className="campo-texto-rotulo">
          O que foi conversado
          <textarea
              value={camposFormulario.conteudo}
              required
              rows={3}
              placeholder="ex.: cliente passou na loja, está satisfeito com a armação..."
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
          <button type="button" className="botao-secundario" onClick={() => salvarContato(false)} disabled={estaEnviando}>
            Registrar sem concluir
          </button>
          <button type="button" className="botao-link" onClick={aoCancelar} disabled={estaEnviando}>
            Cancelar
          </button>
        </div>
      </form>
  );
}
