import { createContext, useState, ReactNode } from "react";

type ValorContextoAutenticacao = {
  estaAutenticado: boolean;
  entrar: (token: string) => void;
  sair: () => void;
};

export const contextoAutenticacao = createContext<ValorContextoAutenticacao | null>(null);

export function ContextoAutenticacao({ children }: { children: ReactNode }) {
  const [estaAutenticado, definirEstaAutenticado] = useState(!!localStorage.getItem("token"));

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
