import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ContextoAutenticacao } from "./contextos_autenticacao/ContextoAutenticacao";
import { RotaProtegida } from "./componentes_layout/RotaProtegida";
import { PaginaLogin } from "./paginas_app/PaginaLogin";
import { PaginaLembretes } from "./paginas_app/PaginaLembretes";
import { PaginaClientes } from "./paginas_app/PaginaClientes";
import { PaginaHistorico } from "./paginas_app/PaginaHistorico";
import { PaginaPainel } from "./paginas_app/PaginaPainel";
import { PaginaAtendentes } from "./paginas_app/PaginaAtendentes";
import { PaginaTags } from "./paginas_app/PaginaTags";

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
                    <Route path="/atendentes" element={<RotaProtegida papeisPermitidos={["admin"]}><PaginaAtendentes /></RotaProtegida>} />
                    <Route path="/tags" element={<RotaProtegida papeisPermitidos={["admin"]}><PaginaTags /></RotaProtegida>} />
                    {/* rota desconhecida volta para o início — sem isso uma URL errada mostra tela em branco, e o `RotaProtegida` do "/" já manda quem não está logado para o login */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </ContextoAutenticacao>
    );
}