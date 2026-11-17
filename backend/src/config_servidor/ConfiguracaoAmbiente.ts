// falha cedo se JWT_SEGREDO não existir, em vez de assinar tokens com segredo vazio
export function obterSegredoJwt(): string {
    const segredoJwt = process.env.JWT_SEGREDO;

    if (!segredoJwt) {
        throw new Error("variável de ambiente JWT_SEGREDO não definida (veja backend/.env.example)");
    }

    return segredoJwt;
}

// o link de recuperação aponta para uma tela do frontend, que não roda no mesmo
// endereço do backend (localhost no desenvolvimento, a VM na publicação)
export function obterUrlFrontend(): string {
    const urlFrontend = process.env.URL_FRONTEND;

    if (!urlFrontend) {
        throw new Error("variável de ambiente URL_FRONTEND não definida (veja backend/.env.example)");
    }

    // sem remover a barra final, o link sairia com barra dupla
    return urlFrontend.replace(/\/+$/, "");
}