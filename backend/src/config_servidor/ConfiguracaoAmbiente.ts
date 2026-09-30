// falha cedo se JWT_SEGREDO não existir, em vez de assinar tokens com segredo vazio
export function obterSegredoJwt(): string {
    const segredoJwt = process.env.JWT_SEGREDO;

    if (!segredoJwt) {
        throw new Error("variável de ambiente JWT_SEGREDO não definida (veja backend/.env.example)");
    }

    return segredoJwt;
}