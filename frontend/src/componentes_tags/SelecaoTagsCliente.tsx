import { useEffect, useState } from "react";
import { definirTagsCliente, type ClienteApi } from "../servicos_api/ApiCliente";
import { listarTags, type TagApi } from "../servicos_api/ApiTag";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";
import { EtiquetasCliente } from "./EtiquetasCliente";

type PropriedadesSelecaoTagsCliente = {
  clienteSelecionado: ClienteApi;
  podeAlterar: boolean;
  aoSalvar: (clienteAtualizado: ClienteApi) => void;
};

function extrairTagIds(cliente: ClienteApi) {
  return (cliente.tags ?? []).map((vinculoTag) => vinculoTag.tag.id);
}

// UC11 · Manter tag (RF12): o administrador classifica o cliente; o atendente só vê as tags
export function SelecaoTagsCliente({ clienteSelecionado, podeAlterar, aoSalvar }: PropriedadesSelecaoTagsCliente) {
  const [tagsDisponiveis, definirTagsDisponiveis] = useState<TagApi[]>([]);
  const [tagIdsMarcadas, definirTagIdsMarcadas] = useState<number[]>(extrairTagIds(clienteSelecionado));
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [mensagemSucesso, definirMensagemSucesso] = useState<string | null>(null);
  const [estaEnviando, definirEstaEnviando] = useState(false);

  useEffect(() => {
    definirTagIdsMarcadas(extrairTagIds(clienteSelecionado));
  }, [clienteSelecionado]);

  useEffect(() => {
    // o atendente não precisa da lista completa: só mostra as tags que já vieram com o cliente
    if (!podeAlterar) return;

    async function carregarTags() {
      try {
        definirTagsDisponiveis(await listarTags());
      } catch (erroRequisicao) {
        definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível carregar as tags."));
      }
    }
    carregarTags();
  }, [podeAlterar]);

  function alternarTag(tagId: number) {
    definirMensagemSucesso(null);
    definirTagIdsMarcadas((tagIdsAtuais) => {
      if (tagIdsAtuais.includes(tagId)) return tagIdsAtuais.filter((tagIdAtual) => tagIdAtual !== tagId);
      return [...tagIdsAtuais, tagId];
    });
  }

  async function salvarTags() {
    definirMensagemErro(null);
    definirMensagemSucesso(null);
    definirEstaEnviando(true);
    try {
      const clienteAtualizado = await definirTagsCliente(clienteSelecionado.id, tagIdsMarcadas);
      definirMensagemSucesso("tags do cliente salvas.");
      aoSalvar(clienteAtualizado);
    } catch (erroRequisicao) {
      definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível salvar as tags."));
    } finally {
      definirEstaEnviando(false);
    }
  }

  if (!podeAlterar) {
    const semTags = (clienteSelecionado.tags ?? []).length === 0;
    if (semTags) return <p className="mensagem-vazia">sem tags.</p>;
    return <EtiquetasCliente tagsCliente={clienteSelecionado.tags} />;
  }

  return (
      <div>
        {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}
        {mensagemSucesso && <p role="status" className="mensagem-sucesso">{mensagemSucesso}</p>}

        {tagsDisponiveis.length === 0 && <p className="mensagem-vazia">nenhuma tag cadastrada ainda.</p>}

        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
          {tagsDisponiveis.map((tagDisponivel) => (
              <label key={tagDisponivel.id} className="inline-flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={tagIdsMarcadas.includes(tagDisponivel.id)}
                    onChange={() => alternarTag(tagDisponivel.id)}
                    className="h-4 w-4 accent-black"
                />
                {tagDisponivel.nome}
              </label>
          ))}
        </div>

        {tagsDisponiveis.length > 0 && (
            <button type="button" className="botao-secundario" onClick={salvarTags} disabled={estaEnviando}>
              {estaEnviando ? "Salvando..." : "Salvar tags"}
            </button>
        )}
      </div>
  );
}
