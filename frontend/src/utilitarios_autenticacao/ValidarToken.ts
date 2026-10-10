import { PapelAcesso } from "../tipos_compartilhados/TiposDominio";

// decodifica o payload de um JWT (sem validar assinatura — isso é papel do
// backend) só pra saber, no cliente, se o token já venceu
export function verificarTokenExpirado(token: string): boolean {
    try {
        const payloadBase64 = token.split(".")[1];
        const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
        const payload = JSON.parse(payloadJson) as { exp?: number };
        if (!payload.exp) return false;
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
}

// lê o papelAcesso gravado no token, só para esconder/mostrar telas e botões
// (a proteção de verdade é o middleware exigirPapel no backend)
export function obterPapelToken(token: string | null): PapelAcesso | null {
    if (!token) return null;
    try {
        const payloadBase64 = token.split(".")[1];
        const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
        const { papelAcesso } = JSON.parse(payloadJson) as { papelAcesso?: PapelAcesso };
        return papelAcesso ?? null;
    } catch {
        return null;
    }
}