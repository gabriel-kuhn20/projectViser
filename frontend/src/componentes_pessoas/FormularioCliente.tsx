import { useEffect, useState } from "react";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import {
  cadastrarCliente,
  editarCliente,
  type ClienteApi,
} from "../servicos_api/ApiCliente";

type PropriedadesFormularioCliente = {
  clienteEmEdicao: ClienteApi | null;
  aoSalvar: (cliente: ClienteApi) => void;
  aoCancelarEdicao: () => void;
};

const camposIniciais = { nome: "", contato: "", endereco: "", dataEntrega: "" };

// UC02 · Cadastrar cliente / UC03 · Editar cliente
export function FormularioCliente({ clienteEmEdicao, aoSalvar, aoCancelarEdicao }: PropriedadesFormularioCliente) {
  const [campos, definirCampos] = useState(camposIniciais);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [estaEnviando, definirEstaEnviando] = useState(false);

  const estaEditando = clienteEmEdicao !== null;

  useEffect(() => {
    if (clienteEmEdicao) {
      definirCampos({
        nome: clienteEmEdicao.pessoa.nome,
        contato: clienteEmEdicao.contato,
        endereco: clienteEmEdicao.endereco ?? "",
        dataEntrega: "",
      });
    } else {
      definirCampos(camposIniciais);
    }
    definirMensagemErro(null);
  }, [clienteEmEdicao]);

  function definirCampo(campo: keyof typeof camposIniciais) {
    return (valor: string) => definirCampos((atual) => ({ ...atual, [campo]: valor }));
  }

  async function enviarFormulario(evento: React.FormEvent) {
    evento.preventDefault();
    definirMensagemErro(null);
    definirEstaEnviando(true);

    try {
      if (estaEditando) {
        const clienteAtualizado = await editarCliente(clienteEmEdicao.id, {
          nome: campos.nome,
          contato: campos.contato,
          endereco: campos.endereco || undefined,
        });
        aoSalvar({ ...clienteAtualizado, pessoa: { ...clienteEmEdicao.pessoa, nome: campos.nome } });
      } else {
        const novoCliente = await cadastrarCliente({
          nome: campos.nome,
          contato: campos.contato,
          endereco: campos.endereco || undefined,
          dataEntrega: campos.dataEntrega,
        });
        aoSalvar(novoCliente);
        definirCampos(camposIniciais);
      }
    } catch (erro: any) {
      definirMensagemErro(erro?.response?.data?.mensagem ?? "não foi possível salvar o cliente. tente novamente.");
    } finally {
      definirEstaEnviando(false);
    }
  }

  return (
    <form onSubmit={enviarFormulario} className="cartao flex flex-col gap-4">
      <h3 className="font-display text-lg text-viser-950">
        {estaEditando ? "Editar cliente" : "Novo cliente"}
      </h3>

      {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}

      <div className="formulario-campo-linha">
        <CampoTexto rotulo="Nome" valor={campos.nome} aoAlterar={definirCampo("nome")} />
        <CampoTexto rotulo="Contato" valor={campos.contato} aoAlterar={definirCampo("contato")} />
      </div>

      <div className="formulario-campo-linha">
        <CampoTexto rotulo="Endereço" valor={campos.endereco} aoAlterar={definirCampo("endereco")} />
        {!estaEditando && (
          <CampoTexto
            rotulo="Data de entrega"
            tipo="date"
            valor={campos.dataEntrega}
            aoAlterar={definirCampo("dataEntrega")}
          />
        )}
      </div>

      <div className="formulario-acoes">
        <BotaoPrimario
          texto={estaEnviando ? "Salvando..." : estaEditando ? "Salvar alterações" : "Cadastrar cliente"}
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
