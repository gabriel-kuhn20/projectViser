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
import { PaginaMarcos } from "./paginas_app/PaginaMarcos";
import { PaginaNovoCliente } from "./paginas_app/PaginaNovoCliente";
import { PaginaInicio } from "./paginas_site/PaginaInicio";
import { PaginaQuemSomos } from "./paginas_site/PaginaQuemSomos";
import { PaginaVisagismo } from "./paginas_site/PaginaVisagismo";
import { PaginaTendencias } from "./paginas_site/PaginaTendencias";

export function App() {
    return (
        <ContextoAutenticacao>
            <BrowserRouter>
                <Routes>
                    {/* site institucional (público) */}
                    <Route path="/" element={<PaginaInicio />} />
                    <Route path="/quem-somos" element={<PaginaQuemSomos />} />
                    <Route path="/visagismo" element={<PaginaVisagismo />} />
                    <Route path="/tendencias" element={<PaginaTendencias />} />

                    {/* sistema de pós-venda (equipe) */}
                    <Route path="/login" element={<PaginaLogin />} />
                    <Route path="/lembretes" element={<RotaProtegida><PaginaLembretes /></RotaProtegida>} />
                    <Route path="/clientes" element={<RotaProtegida><PaginaClientes /></RotaProtegida>} />
                    <Route path="/clientes/novo" element={<RotaProtegida><PaginaNovoCliente /></RotaProtegida>} />
                    <Route path="/historico/:clienteId" element={<RotaProtegida><PaginaHistorico /></RotaProtegida>} />
                    <Route path="/painel" element={<RotaProtegida><PaginaPainel /></RotaProtegida>} />
                    <Route path="/atendentes" element={<RotaProtegida papeisPermitidos={["admin"]}><PaginaAtendentes /></RotaProtegida>} />
                    <Route path="/tags" element={<RotaProtegida papeisPermitidos={["admin"]}><PaginaTags /></RotaProtegida>} />
                    <Route path="/marcos" element={<RotaProtegida papeisPermitidos={["admin"]}><PaginaMarcos /></RotaProtegida>} />
                    {/* rota desconhecida volta para a página inicial do site — sem isso uma URL errada mostra tela em branco */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </ContextoAutenticacao>
    );
}