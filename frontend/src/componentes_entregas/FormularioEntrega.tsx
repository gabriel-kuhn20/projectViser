import { useState } from "react";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { cadastrarEntrega } from "../servicos_api/ApiEntrega";
import { calcularTiposMarcoIgnorados, SelecaoMarcosEntrega } from "./SelecaoMarcosEntrega";
import { usarTiposMarcoAtivos } from "../hooks_dados/useTiposMarcoAtivos";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

type PropriedadesFormularioEntrega = {
  clienteId: number;
  aoCadastrar: () => void;
};

const camposIniciais = { produto: "", dataEntrega: "" };

// UC02 · Manter cliente (RF02): cliente já cadastrado recebe nova entrega, que gera os próprios marcos
export function FormularioEntrega({ clienteId, aoCadastrar }: PropriedadesFormularioEntrega) {
  const [camposFormulario, definirCamposFormulario] = useState(camposIniciais);
  const tiposMarcoAtivos = usarTiposMarcoAtivos();
  const [tiposMarcoMarcados, definirTiposMarcoMarcados] = useState<number[]>([]);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [mensagemSucesso, definirMensagemSucesso] = useState<string | null>(null);
  const [estaEnviando, definirEstaEnviando] = useState(false);

  function definirCampo(campo: keyof typeof camposIniciais) {
    return (valor: string) => definirCamposFormulario((camposAtuais) => ({ ...camposAtuais, [campo]: valor }));
  }

  async function enviarFormulario(eventoEnvio: React.FormEvent) {
    eventoEnvio.preventDefault();
    definirMensagemErro(null);
    definirMensagemSucesso(null);
    // em branco de propósito: a atendente precisa escolher; sem nenhum, a compra não teria acompanhamento
    if (tiposMarcoAtivos.length > 0 && tiposMarcoMarcados.length === 0) {
      definirMensagemErro("marque pelo menos um lembrete para esta compra.");
      return;
    }
    definirEstaEnviando(true);

    try {
      const tiposMarcoIgnorados = calcularTiposMarcoIgnorados(tiposMarcoAtivos, tiposMarcoMarcados);
      await cadastrarEntrega({ clienteId, ...camposFormulario, tiposMarcoIgnorados });
      definirMensagemSucesso(`entrega de ${camposFormulario.produto.trim()} registrada.`);
      definirCamposFormulario(camposIniciais);
      definirTiposMarcoMarcados([]);
      aoCadastrar();
    } catch (erroRequisicao) {
      definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível registrar a entrega. tente novamente."));
    } finally {
      definirEstaEnviando(false);
    }
  }

  return (
      <form onSubmit={enviarFormulario} className="mt-5 flex flex-col">
        <h4 className="secao-titulo mb-3 text-[16px]">Nova entrega</h4>

        {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}
        {mensagemSucesso && <p role="status" className="mensagem-sucesso">{mensagemSucesso}</p>}

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
        </div>
      </form>
  );
}
