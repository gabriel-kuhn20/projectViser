import { useEffect, useState } from "react";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { cadastrarTag, editarTag, type TagApi } from "../servicos_api/ApiTag";

type PropriedadesFormularioTag = {
  tagEmEdicao: TagApi | null;
  aoSalvar: (tag: TagApi) => void;
  aoCancelarEdicao: () => void;
};

// Cadastro/edição de tags
export function FormularioTag({ tagEmEdicao, aoSalvar, aoCancelarEdicao }: PropriedadesFormularioTag) {
  const [nome, definirNome] = useState("");
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [estaEnviando, definirEstaEnviando] = useState(false);

  const estaEditando = tagEmEdicao !== null;

  useEffect(() => {
    definirNome(tagEmEdicao?.nome ?? "");
    definirMensagemErro(null);
  }, [tagEmEdicao]);

  async function enviarFormulario(evento: React.FormEvent) {
    evento.preventDefault();
    definirMensagemErro(null);
    definirEstaEnviando(true);

    try {
      const tagSalva = estaEditando ? await editarTag(tagEmEdicao.id, nome) : await cadastrarTag(nome);
      aoSalvar(tagSalva);
      if (!estaEditando) definirNome("");
    } catch (erro: any) {
      definirMensagemErro(erro?.response?.data?.mensagem ?? "não foi possível salvar a tag. tente novamente.");
    } finally {
      definirEstaEnviando(false);
    }
  }

  return (
    <form onSubmit={enviarFormulario} className="cartao flex flex-col gap-4 max-w-sm">
      <h3 className="font-display text-lg text-viser-950">{estaEditando ? "Editar tag" : "Nova tag"}</h3>

      {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}

      <CampoTexto rotulo="Nome" valor={nome} aoAlterar={definirNome} />

      <div className="formulario-acoes">
        <BotaoPrimario
          texto={estaEnviando ? "Salvando..." : estaEditando ? "Salvar alterações" : "Cadastrar tag"}
          aoClicar={() => {}}
          desabilitado={estaEnviando}
        />
        {estaEditando && (
          <button type="button" className="botao-secundario" onClick={aoCancelarEdicao} disabled={estaEnviando}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
