import { useState } from "react";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { editarInteracao, type InteracaoApi } from "../servicos_api/ApiInteracao";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

type PropriedadesEdicaoInteracao = {
  interacaoEmEdicao: { id: number; conteudo: string; respostaCliente: string | null };
  aoSalvar: (interacaoEditada: InteracaoApi) => void;
  aoCancelar: () => void;
};

// RF05 · correção do texto de uma tentativa já registrada.
// não é um <form>: também aparece dentro do formulário de contato, e form dentro de form não vale no HTML
export function EdicaoInteracao({ interacaoEmEdicao, aoSalvar, aoCancelar }: PropriedadesEdicaoInteracao) {
  const [conteudo, definirConteudo] = useState(interacaoEmEdicao.conteudo);
  const [respostaCliente, definirRespostaCliente] = useState(interacaoEmEdicao.respostaCliente ?? "");
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [estaSalvando, definirEstaSalvando] = useState(false);

  async function salvarEdicao() {
    definirMensagemErro(null);
    if (!conteudo.trim()) {
      definirMensagemErro("o texto do contato não pode ficar em branco.");
      return;
    }

    definirEstaSalvando(true);
    try {
      const interacaoEditada = await editarInteracao(interacaoEmEdicao.id, {
        conteudo: conteudo.trim(),
        respostaCliente: respostaCliente.trim(),
      });
      aoSalvar(interacaoEditada);
    } catch (erroRequisicao) {
      definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível salvar a edição."));
    } finally {
      definirEstaSalvando(false);
    }
  }

  return (
      <div className="mt-3 flex flex-col gap-4">
        {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}
        <label className="campo-texto-rotulo">
          Texto do contato
          <textarea
              value={conteudo}
              rows={3}
              onChange={(eventoCampo) => definirConteudo(eventoCampo.target.value)}
              className="campo-texto-input resize-y leading-relaxed"
          />
        </label>
        <CampoTexto rotulo="Resposta do cliente (opcional)" valor={respostaCliente} aoAlterar={definirRespostaCliente} />
        <div className="flex flex-wrap gap-2">
          <button
              type="button"
              className="botao-link border-black bg-black text-white hover:bg-site-botao"
              onClick={salvarEdicao}
              disabled={estaSalvando}
          >
            {estaSalvando ? "Salvando..." : "Salvar edição"}
          </button>
          <button type="button" className="botao-link" onClick={aoCancelar} disabled={estaSalvando}>
            Cancelar
          </button>
        </div>
      </div>
  );
}

// o histórico não pode mudar sem aviso: quem lê vê que o texto foi corrigido e quando (no title)
export function MarcaEditado({ editadoEm }: { editadoEm: string | null }) {
  if (!editadoEm) return null;

  const dataEdicao = new Date(editadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  return (
      <span title={`editado em ${dataEdicao}`} className="text-black/45">
        (editado)
      </span>
  );
}
