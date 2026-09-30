import { useState } from "react";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { cadastrarAtendente } from "../servicos_api/ApiAtendente";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

// UC10 · Cadastrar conta de atendente
export function FormularioAtendente() {
    const [nomeAtendente, definirNomeAtendente] = useState("");
    const [emailAtendente, definirEmailAtendente] = useState("");
    const [senhaAtendente, definirSenhaAtendente] = useState("");
    const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
    const [mensagemSucesso, definirMensagemSucesso] = useState<string | null>(null);
    const [estaEnviando, definirEstaEnviando] = useState(false);

    async function enviarFormulario(evento: React.FormEvent) {
        evento.preventDefault();
        definirMensagemErro(null);
        definirMensagemSucesso(null);

        if (senhaAtendente.length < 8) {
            definirMensagemErro("a senha precisa ter no mínimo 8 caracteres");
            return;
        }

        definirEstaEnviando(true);
        try {
            await cadastrarAtendente({ nome: nomeAtendente, email: emailAtendente, senha: senhaAtendente });
            definirMensagemSucesso(`atendente "${nomeAtendente}" cadastrado com sucesso`);
            definirNomeAtendente("");
            definirEmailAtendente("");
            definirSenhaAtendente("");
        } catch (erro) {
            definirMensagemErro(formatarMensagemErro(erro, "não foi possível cadastrar o atendente"));
        } finally {
            definirEstaEnviando(false);
        }
    }

    return (
        <form onSubmit={enviarFormulario} className="card card-body" style={{ maxWidth: 480 }}>
            <h2 className="h5 mb-3">Novo atendente</h2>
            <CampoTexto rotulo="Nome" valor={nomeAtendente} aoAlterar={definirNomeAtendente} obrigatorio />
            <CampoTexto rotulo="Email" tipo="email" valor={emailAtendente} aoAlterar={definirEmailAtendente} obrigatorio />
            <CampoTexto rotulo="Senha (mínimo 8 caracteres)" tipo="password" valor={senhaAtendente} aoAlterar={definirSenhaAtendente} obrigatorio />
            {mensagemErro && <div className="alert alert-danger" role="alert">{mensagemErro}</div>}
            {mensagemSucesso && <div className="alert alert-success" role="status">{mensagemSucesso}</div>}
            <BotaoPrimario tipo="submit" texto={estaEnviando ? "Cadastrando..." : "Cadastrar"} desabilitado={estaEnviando} />
        </form>
    );
}