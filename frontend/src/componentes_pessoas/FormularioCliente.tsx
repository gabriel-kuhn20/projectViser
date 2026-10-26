import { useEffect, useState } from "react";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import {
  cadastrarCliente,
  editarCliente,
  type ClienteApi,
} from "../servicos_api/ApiCliente";
import { listarAtendentes, type AtendenteApi } from "../servicos_api/ApiAtendente";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";
import { aplicarMascaraTelefone, formatarTelefone } from "../utilitarios_formatacao/FormatarTelefone";

type PropriedadesFormularioCliente = {
  clienteEmEdicao: ClienteApi | null;
  aoSalvar: (cliente: ClienteApi) => void;
  aoCancelarEdicao: () => void;
};

const camposIniciais = { nome: "", contato: "", endereco: "", responsavelId: "", dataEntrega: "", produto: "" };

// o select trabalha com texto; "" é "sem responsável"
function converterResponsavelId(valorSelecionado: string) {
  if (valorSelecionado === "") return null;
  return Number(valorSelecionado);
}

// UC02 · Manter cliente (RF02)
export function FormularioCliente({ clienteEmEdicao, aoSalvar, aoCancelarEdicao }: PropriedadesFormularioCliente) {
  const { usuarioId } = usarAutenticacao();
  const [campos, definirCampos] = useState(camposIniciais);
  const [atendentes, definirAtendentes] = useState<AtendenteApi[]>([]);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [estaEnviando, definirEstaEnviando] = useState(false);

  const estaEditando = clienteEmEdicao !== null;
  // no cadastro, quem está logado costuma ser quem fez a venda — já vem selecionado
  const responsavelPadrao = usuarioId ? String(usuarioId) : "";

  useEffect(() => {
    async function carregarAtendentes() {
      try {
        definirAtendentes(await listarAtendentes());
      } catch {
        // sem a lista o cliente ainda pode ser salvo sem responsável; o erro não trava o formulário
        definirAtendentes([]);
      }
    }
    carregarAtendentes();
  }, []);

  useEffect(() => {
    definirMensagemErro(null);
    if (!clienteEmEdicao) {
      definirCampos({ ...camposIniciais, responsavelId: responsavelPadrao });
      return;
    }
    definirCampos({
      ...camposIniciais,
      nome: clienteEmEdicao.pessoa.nome,
      // contato antigo salvo só com números já aparece com a máscara ao editar
      contato: formatarTelefone(clienteEmEdicao.contato),
      endereco: clienteEmEdicao.endereco ?? "",
      responsavelId: clienteEmEdicao.responsavelId ? String(clienteEmEdicao.responsavelId) : "",
    });
  }, [clienteEmEdicao, responsavelPadrao]);

  function definirCampo(campo: keyof typeof camposIniciais) {
    return (valor: string) => definirCampos((atual) => ({ ...atual, [campo]: valor }));
  }

  async function enviarFormulario(evento: React.FormEvent) {
    evento.preventDefault();
    definirMensagemErro(null);
    definirEstaEnviando(true);

    const responsavelId = converterResponsavelId(campos.responsavelId);
    try {
      if (clienteEmEdicao) {
        const clienteAtualizado = await editarCliente(clienteEmEdicao.id, {
          nome: campos.nome,
          contato: campos.contato,
          endereco: campos.endereco || undefined,
          responsavelId,
        });
        aoSalvar(clienteAtualizado);
        return;
      }

      const novoCliente = await cadastrarCliente({
        nome: campos.nome,
        contato: campos.contato,
        endereco: campos.endereco || undefined,
        responsavelId: responsavelId ?? undefined,
        dataEntrega: campos.dataEntrega,
        produto: campos.produto,
      });
      aoSalvar(novoCliente);
      definirCampos({ ...camposIniciais, responsavelId: responsavelPadrao });
    } catch (erro) {
      // formatarMensagemErro mostra os detalhes do 400 (ex: data futura) em vez do genérico "dados inválidos"
      definirMensagemErro(formatarMensagemErro(erro, "não foi possível salvar o cliente. tente novamente."));
    } finally {
      definirEstaEnviando(false);
    }
  }

  function escolherTextoBotao() {
    if (estaEnviando) return "Salvando...";
    if (estaEditando) return "Salvar alterações";
    return "Cadastrar cliente";
  }

  return (
      <form onSubmit={enviarFormulario} className="cartao flex flex-col gap-5">
        <h3 className="secao-titulo">
          {estaEditando ? "Editar cliente" : "Novo cliente"}
        </h3>

        {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}

        <div className="formulario-campo-linha">
          <CampoTexto rotulo="Nome" valor={campos.nome} aoAlterar={definirCampo("nome")} obrigatorio />
          <CampoTexto
              rotulo="Contato"
              tipo="tel"
              valor={campos.contato}
              aoAlterar={(valorDigitado) => definirCampo("contato")(aplicarMascaraTelefone(valorDigitado))}
              placeholder="(51) 99999-9999"
              obrigatorio
          />
        </div>

        <div className="formulario-campo-linha">
          <CampoTexto rotulo="Endereço" valor={campos.endereco} aoAlterar={definirCampo("endereco")} />
          <label className="campo-texto-rotulo">
            Atendente responsável
            <select
                value={campos.responsavelId}
                onChange={(evento) => definirCampo("responsavelId")(evento.target.value)}
                className="campo-texto-input"
            >
              <option value="">Sem responsável</option>
              {atendentes.map((atendente) => (
                  <option key={atendente.id} value={atendente.id}>
                    {atendente.pessoa.nome}
                  </option>
              ))}
            </select>
          </label>
        </div>

        {/* a primeira entrega vai junto com o cadastro; as próximas entram pela tela do cliente */}
        {!estaEditando && (
            <div className="formulario-campo-linha">
              <CampoTexto rotulo="Produto comprado" valor={campos.produto} aoAlterar={definirCampo("produto")} obrigatorio />
              <CampoTexto
                  rotulo="Data de entrega"
                  tipo="date"
                  valor={campos.dataEntrega}
                  aoAlterar={definirCampo("dataEntrega")}
                  obrigatorio
              />
            </div>
        )}

        <div className="formulario-acoes">
          <BotaoPrimario texto={escolherTextoBotao()} desabilitado={estaEnviando} />
          {estaEditando && (
              <button type="button" className="botao-secundario" onClick={aoCancelarEdicao} disabled={estaEnviando}>
                Cancelar
              </button>
          )}
        </div>
      </form>
  );
}
