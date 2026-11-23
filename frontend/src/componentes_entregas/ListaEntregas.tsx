import { useState } from "react";
import { type EntregaApi } from "../servicos_api/ApiCliente";
import { editarEntrega, excluirEntrega } from "../servicos_api/ApiEntrega";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { CampoBusca } from "../componentes_compartilhados/CampoBusca";
import { correspondeBusca } from "../utilitarios_formatacao/BuscarTexto";
import { formatarDataSemHora } from "../utilitarios_formatacao/FormatarData";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

type PropriedadesListaEntregas = {
  entregasCliente: EntregaApi[];
  aoAlterar: (mensagemSucesso: string) => void;
};

const camposEdicaoIniciais = { produto: "", dataEntrega: "" };
// com poucas compras a busca só ocupa espaço no cartão
const MINIMO_ENTREGAS_PARA_BUSCA = 4;
// as mais recentes são as que importam no dia a dia; o resto fica atrás do "Ver todas"
const LIMITE_ENTREGAS_RECOLHIDAS = 5;

// a compra já teve conversa registrada em algum dos lembretes
function verificarPossuiContato(entrega: EntregaApi) {
  return (entrega.marcos ?? []).some((marco) =>
      (marco.lembretes ?? []).some((lembrete) => lembrete._count.interacoes > 0)
  );
}

// RF18: entregas do cliente (data e produto), da mais recente para a mais antiga — a API já ordena.
// Editar e excluir corrigem compra cadastrada errado
export function ListaEntregas({ entregasCliente, aoAlterar }: PropriedadesListaEntregas) {
  const { papelAcesso } = usarAutenticacao();
  const [entregaEmEdicaoId, definirEntregaEmEdicaoId] = useState<number | null>(null);
  const [camposEdicao, definirCamposEdicao] = useState(camposEdicaoIniciais);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [estaEnviando, definirEstaEnviando] = useState(false);
  const [termoBusca, definirTermoBusca] = useState("");
  const [mostrarTodas, definirMostrarTodas] = useState(false);
  const entregaEmEdicao = entregasCliente.find((entregaCliente) => entregaCliente.id === entregaEmEdicaoId);

  // busca pelo produto ou pela data como aparece na tela ("22/11" acha 22/11/2026)
  const entregasFiltradas = entregasCliente.filter((entregaCliente) =>
      correspondeBusca(termoBusca, [entregaCliente.produto, formatarDataSemHora(entregaCliente.dataEntrega)])
  );
  // buscando, mostra todos os resultados: o limite é só para a lista inteira não crescer sem fim
  const estaBuscando = termoBusca.trim() !== "";
  const deveRecolher = !estaBuscando && !mostrarTodas && entregasFiltradas.length > LIMITE_ENTREGAS_RECOLHIDAS;
  const entregasVisiveis = deveRecolher ? entregasFiltradas.slice(0, LIMITE_ENTREGAS_RECOLHIDAS) : entregasFiltradas;
  const possuiMaisQueLimite = !estaBuscando && entregasFiltradas.length > LIMITE_ENTREGAS_RECOLHIDAS;

  // RNF06: mesma regra da API — a atendente só exclui compra sem contato registrado
  function verificarPodeExcluir(entrega: EntregaApi) {
    return papelAcesso === "admin" || !verificarPossuiContato(entrega);
  }

  function iniciarEdicao(entrega: EntregaApi) {
    definirMensagemErro(null);
    definirEntregaEmEdicaoId(entrega.id);
    // o input date só aceita AAAA-MM-DD
    definirCamposEdicao({ produto: entrega.produto, dataEntrega: entrega.dataEntrega.slice(0, 10) });
  }

  function cancelarEdicao() {
    definirMensagemErro(null);
    definirEntregaEmEdicaoId(null);
  }

  async function salvarEdicao(eventoEnvio: React.FormEvent) {
    eventoEnvio.preventDefault();
    if (entregaEmEdicaoId === null) return;

    definirMensagemErro(null);
    definirEstaEnviando(true);
    try {
      await editarEntrega(entregaEmEdicaoId, camposEdicao);
      definirEntregaEmEdicaoId(null);
      aoAlterar(`entrega de ${camposEdicao.produto.trim()} atualizada.`);
    } catch (erroRequisicao) {
      // 409: a data não muda depois que algum lembrete da compra teve atendimento
      definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível salvar a entrega. tente novamente."));
    } finally {
      definirEstaEnviando(false);
    }
  }

  async function confirmarExclusao(entrega: EntregaApi) {
    // excluir apaga marcos, lembretes e contatos da compra e não tem volta: confirma antes
    const avisoContatos = verificarPossuiContato(entrega) ? " Os contatos registrados dessa compra também serão apagados." : "";
    const confirmouExclusao = window.confirm(`Excluir a entrega de ${entrega.produto}?${avisoContatos}`);
    if (!confirmouExclusao) return;

    definirMensagemErro(null);
    definirEstaEnviando(true);
    try {
      await excluirEntrega(entrega.id);
      aoAlterar(`entrega de ${entrega.produto} excluída.`);
    } catch (erroRequisicao) {
      definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível excluir a entrega. tente novamente."));
    } finally {
      definirEstaEnviando(false);
    }
  }

  if (entregasCliente.length === 0) {
    return <p className="mensagem-vazia">nenhuma entrega registrada.</p>;
  }

  return (
      <div>
        {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}

        {entregasCliente.length >= MINIMO_ENTREGAS_PARA_BUSCA && (
            <div className="mb-4">
              <CampoBusca
                  rotulo="Buscar entrega"
                  valor={termoBusca}
                  aoAlterar={definirTermoBusca}
                  placeholder="produto ou data"
              />
            </div>
        )}

        {entregasFiltradas.length === 0 && (
            <p className="mensagem-vazia">nenhuma entrega encontrada para essa busca.</p>
        )}

        {entregasFiltradas.length > 0 && (
            <div className="tabela-wrapper">
              <table className="tabela">
                <thead>
                <tr>
                  <th>Entregue em</th>
                  <th>Produto</th>
                  <th aria-label="Ações"></th>
                </tr>
                </thead>
                <tbody>
                {entregasVisiveis.map((entregaCliente) => {
                  return (
                      <tr key={entregaCliente.id}>
                        <td>{formatarDataSemHora(entregaCliente.dataEntrega)}</td>
                        <td>{entregaCliente.produto}</td>
                        <td>
                          <div className="flex justify-end gap-3 whitespace-nowrap text-[12px] font-semibold">
                            <button
                                type="button"
                                className="underline underline-offset-2"
                                onClick={() => iniciarEdicao(entregaCliente)}
                                disabled={estaEnviando}
                            >
                              Editar
                            </button>
                            {verificarPodeExcluir(entregaCliente) && (
                                <button
                                    type="button"
                                    className="text-red-700 underline underline-offset-2"
                                    onClick={() => confirmarExclusao(entregaCliente)}
                                    disabled={estaEnviando}
                                >
                                  Excluir
                                </button>
                            )}
                          </div>
                        </td>
                      </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
        )}

        {possuiMaisQueLimite && (
            <button
                type="button"
                className="mt-3 text-[13px] font-semibold underline underline-offset-2"
                onClick={() => definirMostrarTodas((mostrandoTodas) => !mostrandoTodas)}
            >
              {mostrarTodas ? "Mostrar menos" : `Ver todas as ${entregasFiltradas.length} entregas`}
            </button>
        )}

        {/* fora da tabela: as células têm whitespace-nowrap e espremiam os campos do formulário */}
        {entregaEmEdicao && (
            <form onSubmit={salvarEdicao} className="mt-5 flex flex-col">
              <h4 className="secao-titulo mb-3 text-[16px]">Editar entrega · {entregaEmEdicao.produto}</h4>
              <div className="formulario-campo-linha">
                <CampoTexto
                    rotulo="Produto comprado"
                    valor={camposEdicao.produto}
                    aoAlterar={(valorDigitado) =>
                        definirCamposEdicao((camposAtuais) => ({ ...camposAtuais, produto: valorDigitado }))
                    }
                    obrigatorio
                />
                <CampoTexto
                    rotulo="Data de entrega"
                    tipo="date"
                    valor={camposEdicao.dataEntrega}
                    aoAlterar={(valorDigitado) =>
                        definirCamposEdicao((camposAtuais) => ({ ...camposAtuais, dataEntrega: valorDigitado }))
                    }
                    obrigatorio
                />
              </div>
              <div className="formulario-acoes">
                <button type="submit" className="botao-secundario" disabled={estaEnviando}>
                  {estaEnviando ? "Salvando..." : "Salvar alterações"}
                </button>
                <button type="button" className="botao-link" onClick={cancelarEdicao} disabled={estaEnviando}>
                  Cancelar
                </button>
              </div>
            </form>
        )}
      </div>
  );
}
