// Centraliza a sessão guardada no navegador. A chave estava escrita à mão no
// ClienteHttp e no ContextoAutenticacao; com o botão Sair precisando ler o token antes
// de limpá-lo, virariam três cópias do mesmo texto — e basta uma divergir para a pessoa
// ficar presa numa sessão que o resto do sistema acha que não existe.
const CHAVE_TOKEN = "token";

export function lerTokenSessao(): string | null {
    return localStorage.getItem(CHAVE_TOKEN);
}

export function gravarTokenSessao(token: string) {
    localStorage.setItem(CHAVE_TOKEN, token);
}

export function limparTokenSessao() {
    localStorage.removeItem(CHAVE_TOKEN);
}
