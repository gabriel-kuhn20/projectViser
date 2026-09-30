import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";
import { efetuarLogin } from "../servicos_api/ApiAutenticacao";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

// UC01 · Entrar no sistema (RF01)
export function PaginaLogin() {
  const [email, definirEmail] = useState("");
  const [senha, definirSenha] = useState("");
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [estaEnviando, definirEstaEnviando] = useState(false);

  const { entrar } = usarAutenticacao();
  const navegar = useNavigate();

  async function enviarFormulario(evento: React.FormEvent) {
    evento.preventDefault();
    definirMensagemErro(null);
    definirEstaEnviando(true);

    try {
      const { token } = await efetuarLogin(email, senha);
      entrar(token);
      navegar("/");
    } catch (erro) {
      definirMensagemErro(formatarMensagemErro(erro, "não foi possível entrar. tente novamente."));
    } finally {
      definirEstaEnviando(false);
    }
  }

  return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <form onSubmit={enviarFormulario} className="card card-body shadow-sm" style={{ maxWidth: 400, width: "100%" }}>
          <h1 className="h4 mb-4">Entrar</h1>
          <CampoTexto rotulo="Email" tipo="email" valor={email} aoAlterar={definirEmail} obrigatorio />
          <CampoTexto rotulo="Senha" tipo="password" valor={senha} aoAlterar={definirSenha} obrigatorio />
          {mensagemErro && <div className="alert alert-danger" role="alert">{mensagemErro}</div>}
          <BotaoPrimario tipo="submit" texto={estaEnviando ? "Entrando..." : "Entrar"} desabilitado={estaEnviando} />
        </form>
      </div>
  );
}