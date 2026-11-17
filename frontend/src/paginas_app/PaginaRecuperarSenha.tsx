import { useState } from "react";
import { MolduraAutenticacao } from "../componentes_layout/MolduraAutenticacao";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { solicitarRecuperacaoSenha } from "../servicos_api/ApiAutenticacao";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

// UC12 · Recuperar senha (RF20)
export function PaginaRecuperarSenha() {
    const [email, definirEmail] = useState("");
    const [mensagemConfirmacao, definirMensagemConfirmacao] = useState<string | null>(null);
    const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
    const [estaEnviando, definirEstaEnviando] = useState(false);

    async function enviarFormulario(evento: React.FormEvent) {
        evento.preventDefault();
        definirMensagemErro(null);
        definirEstaEnviando(true);

        try {
            // a API responde o mesmo para e-mail cadastrado e não cadastrado, e a tela
            // repete a resposta sem interpretar: dizer "não encontrado" aqui entregaria
            // para qualquer visitante quais e-mails têm conta no sistema
            const { mensagem } = await solicitarRecuperacaoSenha(email);
            definirMensagemConfirmacao(mensagem);
        } catch (erroRequisicao) {
            definirMensagemErro(
                formatarMensagemErro(erroRequisicao, "não foi possível enviar o link. tente novamente.")
            );
        } finally {
            definirEstaEnviando(false);
        }
    }

    return (
        <MolduraAutenticacao
            titulo="Esqueci minha senha"
            subtitulo="Informe o e-mail da sua conta: enviamos um link para você criar uma senha nova."
            aoEnviar={enviarFormulario}
            destinoVoltar="/login"
            textoVoltar="Voltar para o login"
        >
            <div className="flex flex-col gap-5">
                <CampoTexto
                    rotulo="E-mail"
                    tipo="email"
                    valor={email}
                    aoAlterar={definirEmail}
                    autoComplete="email"
                    obrigatorio
                />
            </div>

            {mensagemConfirmacao && (
                <p role="status" className="mensagem-sucesso mt-5 mb-0">{mensagemConfirmacao}</p>
            )}
            {mensagemErro && <p role="alert" className="mensagem-erro mt-5 mb-0">{mensagemErro}</p>}

            <div className="mt-8">
                <BotaoPrimario texto={estaEnviando ? "Enviando..." : "Enviar link"} desabilitado={estaEnviando} />
            </div>
        </MolduraAutenticacao>
    );
}
