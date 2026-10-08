import { useState } from "react";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { registrarInteracao } from "../servicos_api/ApiInteracao";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

type PropriedadesFormularioInteracao = {
  lembreteId: number;
  aoRegistrar: () => void;
};

const camposIniciais = { conteudo: "", respostaCliente: "" };

// UC07 · Registrar interação (RF05)
export function FormularioInteracao({ lembreteId, aoRegistrar }: PropriedadesFormularioInteracao) {
  const [camposFormulario, definirCamposFormulario] = useState(camposIniciais);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [estaEnviando, definirEstaEnviando] = useState(false);

  async function enviarFormulario(eventoEnvio: React.FormEvent) {
    eventoEnvio.preventDefault();
    definirMensagemErro(null);
    definirEstaEnviando(true);

    try {
      // a API rejeita string vazia, então a resposta só vai se foi preenchida
      await registrarInteracao({
        lembreteId,
        conteudo: camposFormulario.conteudo,
        respostaCliente: camposFormulario.respostaCliente || undefined,
      });
      definirCamposFormulario(camposIniciais);
      aoRegistrar();
    } catch (erroRequisicao) {
      definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível registrar o contato. tente novamente."));
    } finally {
      definirEstaEnviando(false);
    }
  }

  return (
      <form onSubmit={enviarFormulario} className="cartao flex flex-col gap-2 mb-6">
        <h3 className="font-display text-lg text-viser-950">Registrar contato</h3>

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
              className="campo-texto-input resize-y"
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
          <BotaoPrimario texto={estaEnviando ? "Registrando..." : "Registrar contato"} desabilitado={estaEnviando} />
          <span className="text-sm text-viser-900/60">
          Depois de registrar, volte aos lembretes para concluir o contato.
        </span>
        </div>
      </form>
  );
}