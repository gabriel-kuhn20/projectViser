import { useState } from "react";
import { TituloPagina } from "../componentes_layout/TituloPagina";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";
import { trocarPropriaSenha } from "../servicos_api/ApiAutenticacao";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

const TAMANHO_MINIMO_SENHA = 8;

const camposIniciais = { senhaAtual: "", novaSenha: "", confirmacaoSenha: "" };

// UC13 · Trocar a própria senha (RF21)
export function PaginaMinhaConta() {
    const { entrar } = usarAutenticacao();
    const [campos, definirCampos] = useState(camposIniciais);
    const [mensagemSucesso, definirMensagemSucesso] = useState<string | null>(null);
    const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
    const [estaEnviando, definirEstaEnviando] = useState(false);

    function definirCampo(campo: keyof typeof camposIniciais) {
        return (valor: string) => definirCampos((atual) => ({ ...atual, [campo]: valor }));
    }

    async function enviarFormulario(evento: React.FormEvent) {
        evento.preventDefault();
        definirMensagemErro(null);
        definirMensagemSucesso(null);

        if (campos.novaSenha.length < TAMANHO_MINIMO_SENHA) {
            definirMensagemErro(`a senha precisa ter no mínimo ${TAMANHO_MINIMO_SENHA} caracteres`);
            return;
        }

        // o campo é `password`, então um erro de digitação não aparece na tela — sem conferir,
        // a conta ficaria com uma senha que ninguém sabe qual é
        if (campos.novaSenha !== campos.confirmacaoSenha) {
            definirMensagemErro("as senhas não conferem");
            return;
        }

        definirEstaEnviando(true);
        try {
            // quem confere a senha atual é o servidor: a tela não tem como saber se está certa
            const resposta = await trocarPropriaSenha(campos.senhaAtual, campos.novaSenha);
            // a troca derrubou todas as sessões da conta, inclusive esta: o token novo mantém a pessoa aqui.
            // sem token na resposta, nada é gravado — o 401 da próxima chamada leva ao login, que é o certo
            if (resposta.token) entrar(resposta.token);
            definirCampos(camposIniciais);
            definirMensagemSucesso("senha alterada — as outras sessões abertas com a senha antiga foram encerradas");
        } catch (erroRequisicao) {
            definirMensagemErro(formatarMensagemErro(erroRequisicao, "não foi possível alterar a senha."));
        } finally {
            definirEstaEnviando(false);
        }
    }

    return (
        <div>
            <TituloPagina titulo="Minha conta" subtitulo="Troque a senha que você usa para entrar no sistema." />

            <form onSubmit={enviarFormulario} className="cartao flex max-w-[420px] flex-col gap-5">
                <h3 className="secao-titulo">Trocar senha</h3>

                {mensagemErro && <p role="alert" className="mensagem-erro mb-0">{mensagemErro}</p>}
                {mensagemSucesso && <p role="status" className="mensagem-sucesso mb-0">{mensagemSucesso}</p>}

                <CampoTexto
                    rotulo="Senha atual"
                    tipo="password"
                    valor={campos.senhaAtual}
                    aoAlterar={definirCampo("senhaAtual")}
                    autoComplete="current-password"
                    obrigatorio
                />
                <CampoTexto
                    rotulo={`Nova senha (mínimo ${TAMANHO_MINIMO_SENHA} caracteres)`}
                    tipo="password"
                    valor={campos.novaSenha}
                    aoAlterar={definirCampo("novaSenha")}
                    autoComplete="new-password"
                    obrigatorio
                />
                <CampoTexto
                    rotulo="Confirme a nova senha"
                    tipo="password"
                    valor={campos.confirmacaoSenha}
                    aoAlterar={definirCampo("confirmacaoSenha")}
                    autoComplete="new-password"
                    obrigatorio
                />

                <div className="formulario-acoes">
                    <BotaoPrimario texto={estaEnviando ? "Salvando..." : "Salvar senha"} desabilitado={estaEnviando} />
                </div>
            </form>
        </div>
    );
}
