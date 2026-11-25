import { useEffect, useState } from "react";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { cadastrarAtendente, editarAtendente, type AtendenteApi } from "../servicos_api/ApiAtendente";
import { type PapelAcesso } from "../tipos_compartilhados/TiposDominio";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

type PropriedadesFormularioAtendente = {
    atendenteEmEdicao: AtendenteApi | null;
    aoSalvar: () => void;
    aoCancelarEdicao: () => void;
};

const camposIniciais = { nome: "", email: "", senha: "", confirmacaoSenha: "", papelAcesso: "atendente" as PapelAcesso };

// UC10 · Manter conta de usuário (RF09): cadastro e edição da conta (nome, e-mail e papel)
// o papel já é escolhido no cadastro (padrão atendente): criar um admin não exige criar e depois editar
export function FormularioAtendente({ atendenteEmEdicao, aoSalvar, aoCancelarEdicao }: PropriedadesFormularioAtendente) {
    const [campos, definirCampos] = useState(camposIniciais);
    const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
    const [mensagemSucesso, definirMensagemSucesso] = useState<string | null>(null);
    const [estaEnviando, definirEstaEnviando] = useState(false);

    const estaEditando = atendenteEmEdicao !== null;

    useEffect(() => {
        definirCampos(
            atendenteEmEdicao
                ? {
                      nome: atendenteEmEdicao.pessoa.nome,
                      email: atendenteEmEdicao.email,
                      senha: "",
                      confirmacaoSenha: "",
                      papelAcesso: atendenteEmEdicao.papelAcesso,
                  }
                : camposIniciais
        );
        definirMensagemErro(null);
        definirMensagemSucesso(null);
    }, [atendenteEmEdicao]);

    function definirCampo(campo: "nome" | "email" | "senha" | "confirmacaoSenha") {
        return (valor: string) => definirCampos((atual) => ({ ...atual, [campo]: valor }));
    }

    async function enviarFormulario(evento: React.FormEvent) {
        evento.preventDefault();
        definirMensagemErro(null);
        definirMensagemSucesso(null);

        if (!estaEditando && campos.senha.length < 8) {
            definirMensagemErro("a senha precisa ter no mínimo 8 caracteres");
            return;
        }

        // o campo é `password`, então um erro de digitação não aparece na tela —
        // sem conferir, a conta nasceria com uma senha que ninguém sabe qual é
        if (!estaEditando && campos.senha !== campos.confirmacaoSenha) {
            definirMensagemErro("as senhas não conferem");
            return;
        }

        definirEstaEnviando(true);
        try {
            if (atendenteEmEdicao) {
                await editarAtendente(atendenteEmEdicao.id, {
                    nome: campos.nome,
                    email: campos.email,
                    papelAcesso: campos.papelAcesso,
                });
            } else {
                await cadastrarAtendente({
                    nome: campos.nome,
                    email: campos.email,
                    senha: campos.senha,
                    papelAcesso: campos.papelAcesso,
                });
                definirMensagemSucesso(`conta de ${campos.nome} criada com sucesso`);
                definirCampos(camposIniciais);
            }
            aoSalvar();
        } catch (erro) {
            definirMensagemErro(formatarMensagemErro(erro, "não foi possível salvar a conta"));
        } finally {
            definirEstaEnviando(false);
        }
    }

    return (
        <form onSubmit={enviarFormulario} className="cartao flex flex-col gap-5">
            <h3 className="secao-titulo">{estaEditando ? "Editar conta" : "Nova conta"}</h3>

            {mensagemErro && <p role="alert" className="mensagem-erro mb-0">{mensagemErro}</p>}
            {mensagemSucesso && <p role="status" className="mensagem-sucesso mb-0">{mensagemSucesso}</p>}

            <CampoTexto rotulo="Nome" valor={campos.nome} aoAlterar={definirCampo("nome")} obrigatorio />
            <CampoTexto rotulo="E-mail" tipo="email" valor={campos.email} aoAlterar={definirCampo("email")} obrigatorio />

            <label className="campo-texto-rotulo">
                Papel
                <select
                    value={campos.papelAcesso}
                    onChange={(evento) =>
                        definirCampos((atual) => ({ ...atual, papelAcesso: evento.target.value as PapelAcesso }))
                    }
                    className="campo-texto-input"
                >
                    <option value="atendente">Atendente</option>
                    <option value="admin">Administrador</option>
                </select>
            </label>

            {/* a senha só entra no cadastro; na edição ela é trocada pelo link de recuperação */}
            {!estaEditando && (
                <>
                    <CampoTexto
                        rotulo="Senha (mínimo 8 caracteres)"
                        tipo="password"
                        valor={campos.senha}
                        aoAlterar={definirCampo("senha")}
                        autoComplete="new-password"
                        obrigatorio
                    />
                    <CampoTexto
                        rotulo="Confirmar senha"
                        tipo="password"
                        valor={campos.confirmacaoSenha}
                        aoAlterar={definirCampo("confirmacaoSenha")}
                        autoComplete="new-password"
                        obrigatorio
                    />
                </>
            )}

            <div className="formulario-acoes">
                <BotaoPrimario
                    texto={estaEnviando ? "Salvando..." : estaEditando ? "Salvar alterações" : "Criar conta"}
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
