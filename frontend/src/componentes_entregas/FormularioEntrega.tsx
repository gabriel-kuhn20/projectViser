import { useState } from "react";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { cadastrarEntrega } from "../servicos_api/ApiEntrega";
import { calcularTiposMarcoIgnorados, SelecaoMarcosEntrega } from "./SelecaoMarcosEntrega";
import { usarTiposMarcoAtivos } from "../hooks_dados/useTiposMarcoAtivos";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

type PropriedadesFormularioEntrega = {
  clienteId: number;
  aoCadastrar: (mensagemSucesso: string) => void;
  // ausente quando o cliente não tem entrega nenhuma: aí o formulário é a única ação da tela
  aoCancelar?: () => void;
};

const camposIniciais = { produto: "", dataEntrega: "" };

// UC02 · Manter cliente (RF02): cliente já cadastrado recebe nova entrega, que gera os próprios marcos
export function FormularioEntrega({ clienteId, aoCadastrar, aoCancelar }: PropriedadesFormularioEntrega) {
  const [camposFormulario, definirCamposFormulario] = useState(camposIniciais);
  const tiposMarcoAtivos = usarTiposMarcoAtivos();
  const [tiposMarcoMarcados, definirTiposMarcoMarcados] = useState<number[]>([]);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [estaEnviando, definirEstaEnviando] = useState(false);

  function definirCampo(campo: keyof typeof camposIniciais) {
    return (valor: string) => definirCamposFormulario((camposAtuais) => ({ ...camposAtuais, [campo]: valor }));
  }

  async function enviarFormulario(eventoEnvio: React.FormEvent) {
    eventoEnvio.preventDefault();
    definirMensagemErro(null);
    // em branco de propósito: a atendente precisa escolher; sem nenhum, a compra não teria acompanhamento
    if (tiposMarcoAtivos.length > 0 && tiposMarcoMarcados.length === 0) {
      definirMensagemErro("marque pelo menos um lembrete para esta compra.");
      return;
    }
    definirEstaEnviando(true);

    try {
      const tiposMarcoIgnorados = calcularTiposMarcoIgnorados(tiposMarcoAtivos, tiposMarcoMarcados);
      await cadastrarEntrega({ clienteId, ...camposFormulario, tiposMarcoIgnorados });
      definirCamposFormulario(camposIniciais);
      definirTiposMarcoMarcados([]);
      // o formulário fecha ao salvar, então a mensagem de sucesso fica a cargo da página
      aoCadastrar(`entrega de ${camposFormulario.produto.trim()} registrada.`);
    } catch (erroRequisicao) {
      definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível registrar a entrega. tente novamente."));
    } finally {
      definirEstaEnviando(false);
    }
  }

  return (
      // mb-6 e borda: separa o formulário da lista que vem logo abaixo
      <form onSubmit={enviarFormulario} className="mb-6 flex flex-col border-b border-black/10 pb-6">
        <h4 className="secao-titulo mb-3 text-[16px]">Nova entrega</h4>

        {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}

        <div className="formulario-campo-linha">
          <CampoTexto rotulo="Produto comprado" valor={camposFormulario.produto} aoAlterar={definirCampo("produto")} obrigatorio />
          <CampoTexto
              rotulo="Data de entrega"
              tipo="date"
              valor={camposFormulario.dataEntrega}
              aoAlterar={definirCampo("dataEntrega")}
              obrigatorio
          />
        </div>

        {/* mb-5: o botão colado nas caixas parecia fazer parte da escolha */}
        <div className="mt-4 mb-5">
          <SelecaoMarcosEntrega
              tiposMarcoAtivos={tiposMarcoAtivos}
              tiposMarcoMarcados={tiposMarcoMarcados}
              aoAlterar={definirTiposMarcoMarcados}
          />
        </div>

        <div className="formulario-acoes">
          <BotaoPrimario texto={estaEnviando ? "Registrando..." : "Registrar entrega"} desabilitado={estaEnviando} />
          {aoCancelar && (
              <button type="button" className="botao-link" onClick={aoCancelar} disabled={estaEnviando}>
                Cancelar
              </button>
          )}
        </div>
      </form>
  );
}
