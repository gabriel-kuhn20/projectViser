import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";
import { efetuarLogin } from "../servicos_api/ApiAutenticacao";
import { LogoViser } from "../componentes_site/LogoViser";
import { FotoSite } from "../componentes_site/FotoSite";
import { IconeVoltar } from "../componentes_layout/IconesMenu";

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
      <div className="login-shell">
        {/* lado da foto, igual ao topo do site */}
        <div className="relative hidden overflow-hidden bg-site-hero lg:block">
          <FotoSite chave="heroInicio" tom="escuro" prioritaria className="absolute inset-0 h-full w-full object-[70%_0%]" />
          <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 p-12 text-white">
            <LogoViser className="h-[64px] w-auto text-[#e4e1da]" />
            <p className="mt-6 text-[30px] leading-[1.1]">
              Sua essência.
              <br />
              Seu estilo.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
          <form onSubmit={enviarFormulario} className="login-card">
            <LogoViser className="mb-12 h-[44px] w-auto lg:hidden" />
            <h1 className="login-titulo">Entrar</h1>
            <p className="pagina-subtitulo">Acesso da equipe ao sistema de pós-venda.</p>
            <span className="pagina-barra" aria-hidden="true" />

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

            <Link to="/" className="link-voltar mt-8 mb-0 self-center">
              <IconeVoltar className="h-4 w-4" />
              Voltar ao site
            </Link>
          </form>
        </div>
      </div>
  );
}
