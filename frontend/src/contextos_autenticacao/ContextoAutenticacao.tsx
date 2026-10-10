import { createContext, useState, ReactNode } from "react";
import { obterPapelToken, verificarTokenExpirado } from "../utilitarios_autenticacao/ValidarToken";
import { PapelAcesso } from "../tipos_compartilhados/TiposDominio";

type ValorContextoAutenticacao = {
  estaAutenticado: boolean;
  papelAcesso: PapelAcesso | null;
  entrar: (token: string) => void;
  sair: () => void;
};

export const contextoAutenticacao = createContext<ValorContextoAutenticacao | null>(null);

// bootstrap: não basta checar se existe token no localStorage, precisa
// checar se ele ainda é válido — senão o usuário "entra" com um token morto
// e só descobre no primeiro 401
function verificarTokenValidoNoStorage(): boolean {
  const token = localStorage.getItem("token");
  if (!token) return false;
  if (verificarTokenExpirado(token)) {
    localStorage.removeItem("token");
    return false;
  }
  return true;
}

export function ContextoAutenticacao({ children }: { children: ReactNode }) {
  const [estaAutenticado, definirEstaAutenticado] = useState(verificarTokenValidoNoStorage);
  // precisa vir DEPOIS do useState acima: se o token venceu, ele já foi removido do storage
  const [papelAcesso, definirPapelAcesso] = useState<PapelAcesso | null>(
    () => obterPapelToken(localStorage.getItem("token"))
  );

  function entrar(token: string) {
    localStorage.setItem("token", token);
    definirEstaAutenticado(true);
    definirPapelAcesso(obterPapelToken(token));
  }

  function sair() {
    localStorage.removeItem("token");
    definirEstaAutenticado(false);
    definirPapelAcesso(null);
  }

  return (
      <contextoAutenticacao.Provider value={{ estaAutenticado, papelAcesso, entrar, sair }}>
        {children}
      </contextoAutenticacao.Provider>
  );
}