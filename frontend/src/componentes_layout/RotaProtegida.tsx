import { Navigate } from "react-router-dom";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";
import { LayoutPrincipal } from "./LayoutPrincipal";

// RNF03: um usuário não autenticado não acessa nenhuma tela ou dado de cliente
export function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { estaAutenticado } = usarAutenticacao();
  if (!estaAutenticado) return <Navigate to="/login" replace />;
  return <LayoutPrincipal>{children}</LayoutPrincipal>;
}