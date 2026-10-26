import { useState } from "react";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { concluirLembrete, type LembreteApi } from "../servicos_api/ApiLembrete";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";
import { formatarTelefone } from "../utilitarios_formatacao/FormatarTelefone";

type PropriedadesFormularioInteracao = {
  lembreteSelecionado: LembreteApi;
  aoConcluir: (lembreteConcluido: LembreteApi) => void;
  aoCancelar: () => void;
};

const camposIniciais = { conteudo: "", respostaCliente: "" };

// UC07 · Concluir lembrete de contato (RF07, RF17): o "concluir" abre este formulário e a
// interação é gravada junto com a conclusão — A1: sem o que foi conversado, não conclui
export function FormularioInteracao({ lembreteSelecionado, aoConcluir, aoCancelar }: PropriedadesFormularioInteracao) {
  const [camposFormulario, definirCamposFormulario] = useState(camposIniciais);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [estaEnviando, definirEstaEnviando] = useState(false);

  const entregaLembrete = lembreteSelecionado.marco.entrega;

  async function enviarFormulario(eventoEnvio: React.FormEvent) {
    eventoEnvio.preventDefault();
    definirMensagemErro(null);
    definirEstaEnviando(true);

    try {
      // a API rejeita string vazia, então a resposta só vai se foi preenchida
      await concluirLembrete(lembreteSelecionado.id, {
        conteudo: camposFormulario.conteudo,
        respostaCliente: camposFormulario.respostaCliente || undefined,
      });
      aoConcluir(lembreteSelecionado);
    } catch (erroRequisicao) {
      definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível concluir o contato. tente novamente."));
    } finally {
      definirEstaEnviando(false);
    }
  }

  return (
      <form onSubmit={enviarFormulario} className="cartao mb-8 flex flex-col gap-5">
        <div>
          <h3 className="secao-titulo">Concluir contato com {entregaLembrete.cliente.pessoa.nome}</h3>
          <p className="mt-1 text-[14px] text-black/60">
            {entregaLembrete.produto} · {formatarTelefone(entregaLembrete.cliente.contato)}
          </p>
        </div>

        {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}

        <label className="campo-texto-rotulo">
          O que foi conversado
          <textarea
              value={camposFormulario.conteudo}
              required
              rows={3}
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
          <BotaoPrimario texto={estaEnviando ? "Concluindo..." : "Concluir contato"} desabilitado={estaEnviando} />
          <button type="button" className="botao-secundario" onClick={aoCancelar} disabled={estaEnviando}>
            Cancelar
          </button>
        </div>
      </form>
  );
}