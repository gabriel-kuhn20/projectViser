import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ContextoAutenticacao } from "./contextos_autenticacao/ContextoAutenticacao";
import { RotaProtegida } from "./componentes_layout/RotaProtegida";
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
          <Route path="/" element={<RotaProtegida><PaginaLembretes /></RotaProtegida>} />
          <Route path="/clientes" element={<RotaProtegida><PaginaClientes /></RotaProtegida>} />
          <Route path="/historico/:clienteId" element={<RotaProtegida><PaginaHistorico /></RotaProtegida>} />
          <Route path="/painel" element={<RotaProtegida><PaginaPainel /></RotaProtegida>} />
          <Route path="/atendentes" element={<RotaProtegida><PaginaAtendentes /></RotaProtegida>} />
        </Routes>
      </BrowserRouter>
    </ContextoAutenticacao>
  );
}
