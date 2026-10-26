import { PapelAcesso } from "../tipos_compartilhados/TiposDominio";

type PayloadToken = { exp?: number; usuarioId?: number; papelAcesso?: PapelAcesso };

// decodifica o payload de um JWT (sem validar assinatura — isso é papel do backend);
// as três leituras abaixo usam esta função para a decodificação existir num lugar só
function decodificarPayloadToken(token: string): PayloadToken {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payloadJson) as PayloadToken;
}

// só pra saber, no cliente, se o token já venceu
export function verificarTokenExpirado(token: string): boolean {
    try {
        const { exp } = decodificarPayloadToken(token);
        if (!exp) return false;
        return Date.now() >= exp * 1000;
    } catch {
        return true;
    }
}

// lê o papelAcesso gravado no token, só para esconder/mostrar telas e botões
// (a proteção de verdade é o middleware exigirPapel no backend)
export function obterPapelToken(token: string | null): PapelAcesso | null {
    if (!token) return null;
    try {
        return decodificarPayloadToken(token).papelAcesso ?? null;
    } catch {
        return null;
    }
}

// lê o id do usuário logado, para a tela saber se um atendimento é dele
// (quem decide de verdade se ele pode liberar é o backend)
export function obterUsuarioIdToken(token: string | null): number | null {
    if (!token) return null;
    try {
        return decodificarPayloadToken(token).usuarioId ?? null;
    } catch {
        return null;
    }
}
