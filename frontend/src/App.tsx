import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ContextoAutenticacao } from "./contextos_autenticacao/ContextoAutenticacao";
import { RotaProtegida } from "./componentes_layout/RotaProtegida";
import { LayoutPrincipal } from "./componentes_layout/LayoutPrincipal";
import { PaginaLogin } from "./paginas_app/PaginaLogin";
import { PaginaLembretes } from "./paginas_app/PaginaLembretes";
import { PaginaClientes } from "./paginas_app/PaginaClientes";
import { PaginaHistorico } from "./paginas_app/PaginaHistorico";
import { PaginaPainel } from "./paginas_app/PaginaPainel";
import { PaginaAtendentes } from "./paginas_app/PaginaAtendentes";


export function App() {
  return (
      <ContextoAutenticacao>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PaginaLogin />} />
            <Route element={<RotaProtegida><LayoutPrincipal /></RotaProtegida>}>
              <Route path="/" element={<PaginaLembretes />} />
              <Route path="/clientes" element={<PaginaClientes />} />
              <Route path="/historico/:clienteId" element={<PaginaHistorico />} />
              <Route path="/painel" element={<PaginaPainel />} />
              <Route path="/atendentes" element={<PaginaAtendentes />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ContextoAutenticacao>
  );
}