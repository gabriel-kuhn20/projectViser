import { Navigate } from "react-router-dom";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";

// RNF03: um usuário não autenticado não acessa nenhuma tela ou dado de cliente
export function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { estaAutenticado } = usarAutenticacao();
  return estaAutenticado ? <>{children}</> : <Navigate to="/login" replace />;
}
