import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";
import { efetuarLogin } from "../servicos_api/ApiAutenticacao";

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
    } catch (erro: any) {
      definirMensagemErro(erro?.response?.data?.mensagem ?? "não foi possível entrar. tente novamente.");
    } finally {
      definirEstaEnviando(false);
    }
  }

  return (
      <form onSubmit={enviarFormulario}>
        <h1>Entrar</h1>
        <CampoTexto rotulo="Email" valor={email} aoAlterar={definirEmail} />
        <CampoTexto rotulo="Senha" valor={senha} tipo="password" aoAlterar={definirSenha} />
        {mensagemErro && <p role="alert">{mensagemErro}</p>}
        <BotaoPrimario texto={estaEnviando ? "Entrando..." : "Entrar"} aoClicar={() => {}} />
      </form>
  );
}