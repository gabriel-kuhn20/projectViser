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