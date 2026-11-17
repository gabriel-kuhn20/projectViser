import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { MolduraAutenticacao } from "../componentes_layout/MolduraAutenticacao";
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

  const { entrar, estaAutenticado } = usarAutenticacao();
  const navegar = useNavigate();

  // sessão ainda válida — mostrar o login de novo só faria a atendente entrar duas vezes;
  // fica depois de todos os hooks porque um retorno antes deles quebra a regra dos hooks do React
  if (estaAutenticado) return <Navigate to="/painel" replace />;

  async function enviarFormulario(evento: React.FormEvent) {
    evento.preventDefault();
    definirMensagemErro(null);
    definirEstaEnviando(true);

    try {
      const { token } = await efetuarLogin(email, senha);
      entrar(token);
      // replace: o botão voltar do navegador não deve levar de volta ao formulário de login
      // RF19: a tela inicial é o painel de pendências por marco
      navegar("/painel", { replace: true });
    } catch (erro: any) {
      definirMensagemErro(erro?.response?.data?.mensagem ?? "não foi possível entrar. tente novamente.");
    } finally {
      definirEstaEnviando(false);
    }
  }

  return (
      <MolduraAutenticacao
          titulo="Entrar"
          subtitulo="Acesso da equipe ao sistema de pós-venda."
          aoEnviar={enviarFormulario}
          destinoVoltar="/"
          textoVoltar="Voltar ao site"
      >
        <div className="flex flex-col gap-5">
          <CampoTexto rotulo="E-mail" tipo="email" valor={email} aoAlterar={definirEmail} autoComplete="email" obrigatorio />
          <CampoTexto
              rotulo="Senha"
              tipo="password"
              valor={senha}
              aoAlterar={definirSenha}
              autoComplete="current-password"
              obrigatorio
          />
        </div>

        {mensagemErro && <p role="alert" className="mensagem-erro mt-5 mb-0">{mensagemErro}</p>}

        <div className="mt-8">
          <BotaoPrimario texto={estaEnviando ? "Entrando..." : "Entrar"} desabilitado={estaEnviando} />
        </div>

        {/* UC12 · Recuperar senha (RF20) */}
        <Link to="/recuperar-senha" className="link-voltar mt-6 mb-0 self-center">
          Esqueci minha senha
        </Link>
      </MolduraAutenticacao>
  );
}
