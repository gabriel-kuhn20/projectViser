import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { MolduraAutenticacao } from "../componentes_layout/MolduraAutenticacao";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { redefinirSenha } from "../servicos_api/ApiAutenticacao";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

const TAMANHO_MINIMO_SENHA = 8;

// UC12 · Recuperar senha (RF20): redefinir a senha pelo link recebido
export function PaginaRedefinirSenha() {
    const [parametrosUrl] = useSearchParams();
    const [novaSenha, definirNovaSenha] = useState("");
    const [confirmacaoSenha, definirConfirmacaoSenha] = useState("");
    const [senhaRedefinida, definirSenhaRedefinida] = useState(false);
    const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
    const [estaEnviando, definirEstaEnviando] = useState(false);

    const navegar = useNavigate();
    const token = parametrosUrl.get("token");

    // sem token na URL não há o que redefinir — acontece quando o link é aberto pela metade
    // ou quando alguém digita o endereço direto; fica depois dos hooks por causa da regra do React
    if (!token) return <Navigate to="/recuperar-senha" replace />;

    async function enviarFormulario(evento: React.FormEvent) {
        evento.preventDefault();
        definirMensagemErro(null);

        if (novaSenha.length < TAMANHO_MINIMO_SENHA) {
            definirMensagemErro(`a senha precisa ter no mínimo ${TAMANHO_MINIMO_SENHA} caracteres`);
            return;
        }

        // o campo é `password`, então um erro de digitação não aparece na tela — sem conferir,
        // a conta ficaria com uma senha que ninguém sabe qual é (a API confere de novo)
        if (novaSenha !== confirmacaoSenha) {
            definirMensagemErro("as senhas não conferem");
            return;
        }

        definirEstaEnviando(true);
        try {
            await redefinirSenha(token!, novaSenha, confirmacaoSenha);
            definirSenhaRedefinida(true);
        } catch (erroRequisicao) {
            definirMensagemErro(
                formatarMensagemErro(erroRequisicao, "não foi possível redefinir a senha. tente novamente.")
            );
        } finally {
            definirEstaEnviando(false);
        }
    }

    if (senhaRedefinida) {
        return (
            <MolduraAutenticacao
                titulo="Senha redefinida"
                subtitulo="Pronto: sua senha foi alterada."
                aoEnviar={(evento) => evento.preventDefault()}
                destinoVoltar="/"
                textoVoltar="Voltar ao site"
            >
                <p role="status" className="mensagem-sucesso mt-5 mb-0">
                    entre com a senha nova para acessar o sistema
                </p>

                <div className="mt-8">
                    <BotaoPrimario texto="Ir para o login" tipo="button" aoClicar={() => navegar("/login")} />
                </div>
            </MolduraAutenticacao>
        );
    }

    return (
        <MolduraAutenticacao
            titulo="Criar senha nova"
            subtitulo="Escolha a senha que você vai usar para entrar no sistema."
            aoEnviar={enviarFormulario}
            destinoVoltar="/login"
            textoVoltar="Voltar para o login"
        >
            <div className="flex flex-col gap-5">
                <CampoTexto
                    rotulo={`Nova senha (mínimo ${TAMANHO_MINIMO_SENHA} caracteres)`}
                    tipo="password"
                    valor={novaSenha}
                    aoAlterar={definirNovaSenha}
                    autoComplete="new-password"
                    obrigatorio
                />
                <CampoTexto
                    rotulo="Confirme a nova senha"
                    tipo="password"
                    valor={confirmacaoSenha}
                    aoAlterar={definirConfirmacaoSenha}
                    autoComplete="new-password"
                    obrigatorio
                />
            </div>

            {mensagemErro && <p role="alert" className="mensagem-erro mt-5 mb-0">{mensagemErro}</p>}

            <div className="mt-8">
                <BotaoPrimario texto={estaEnviando ? "Salvando..." : "Salvar senha"} desabilitado={estaEnviando} />
            </div>
        </MolduraAutenticacao>
    );
}
