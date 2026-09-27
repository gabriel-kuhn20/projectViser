import { createContext, useState, ReactNode } from "react";
import { verificarTokenExpirado } from "../utilitarios_autenticacao/ValidarToken";

type ValorContextoAutenticacao = {
  estaAutenticado: boolean;
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

  function entrar(token: string) {
    localStorage.setItem("token", token);
    definirEstaAutenticado(true);
  }

  function sair() {
    localStorage.removeItem("token");
    definirEstaAutenticado(false);
  }

  return (
      <contextoAutenticacao.Provider value={{ estaAutenticado, entrar, sair }}>
        {children}
      </contextoAutenticacao.Provider>
  );
}