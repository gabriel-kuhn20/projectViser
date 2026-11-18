import { createContext, useState, ReactNode } from "react";
import { obterPapelToken, obterUsuarioIdToken, verificarTokenExpirado } from "../utilitarios_autenticacao/ValidarToken";
import { gravarTokenSessao, lerTokenSessao, limparTokenSessao } from "../utilitarios_autenticacao/SessaoArmazenada";
import { PapelAcesso } from "../tipos_compartilhados/TiposDominio";

type ValorContextoAutenticacao = {
  estaAutenticado: boolean;
  papelAcesso: PapelAcesso | null;
  usuarioId: number | null;
  entrar: (token: string) => void;
  sair: () => void;
};

export const contextoAutenticacao = createContext<ValorContextoAutenticacao | null>(null);

// bootstrap: não basta checar se existe token no localStorage, precisa
// checar se ele ainda é válido — senão o usuário "entra" com um token morto
// e só descobre no primeiro 401
function verificarTokenValidoNoStorage(): boolean {
  const token = lerTokenSessao();
  if (!token) return false;
  if (verificarTokenExpirado(token)) {
    limparTokenSessao();
    return false;
  }
  return true;
}

export function ContextoAutenticacao({ children }: { children: ReactNode }) {
  const [estaAutenticado, definirEstaAutenticado] = useState(verificarTokenValidoNoStorage);
  // precisam vir DEPOIS do useState acima: se o token venceu, ele já foi removido do storage
  const [papelAcesso, definirPapelAcesso] = useState<PapelAcesso | null>(
    () => obterPapelToken(lerTokenSessao())
  );
  const [usuarioId, definirUsuarioId] = useState<number | null>(
    () => obterUsuarioIdToken(lerTokenSessao())
  );

  function entrar(token: string) {
    gravarTokenSessao(token);
    definirEstaAutenticado(true);
    definirPapelAcesso(obterPapelToken(token));
    definirUsuarioId(obterUsuarioIdToken(token));
  }

  function sair() {
    limparTokenSessao();
    definirEstaAutenticado(false);
    definirPapelAcesso(null);
    definirUsuarioId(null);
  }

  return (
      <contextoAutenticacao.Provider value={{ estaAutenticado, papelAcesso, usuarioId, entrar, sair }}>
        {children}
      </contextoAutenticacao.Provider>
  );
}
