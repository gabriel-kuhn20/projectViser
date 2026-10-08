import { Navigate } from "react-router-dom";
import { usarAutenticacao } from "../hooks_dados/useAutenticacao";
import { PapelAcesso } from "../tipos_compartilhados/TiposDominio";
import { LayoutPrincipal } from "./LayoutPrincipal";

type PropriedadesRotaProtegida = {
  children: React.ReactNode;
  papeisPermitidos?: PapelAcesso[];
};

// RNF03: um usuário não autenticado não acessa nenhuma tela ou dado de cliente
// papeisPermitidos (opcional): se informado, só esses papéis entram na tela
export function RotaProtegida({ children, papeisPermitidos }: PropriedadesRotaProtegida) {
  const { estaAutenticado, papelAcesso } = usarAutenticacao();
  if (!estaAutenticado) return <Navigate to="/login" replace />;
  if (papeisPermitidos && (!papelAcesso || !papeisPermitidos.includes(papelAcesso))) {
    return <Navigate to="/" replace />;
  }
  return <LayoutPrincipal>{children}</LayoutPrincipal>;
}