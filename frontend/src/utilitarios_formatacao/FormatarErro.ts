// extrai a mensagem devolvida pela API: { mensagem } ou { mensagem, detalhes: [{ campo, mensagem }] }
export function formatarMensagemErro(erro: any, mensagemPadrao: string): string {
    const dadosResposta = erro?.response?.data;

    if (Array.isArray(dadosResposta?.detalhes) && dadosResposta.detalhes.length > 0) {
        return dadosResposta.detalhes
            .map((detalhe: { campo: string; mensagem: string }) => `${detalhe.campo}: ${detalhe.mensagem}`)
            .join("; ");
    }

    return dadosResposta?.mensagem ?? mensagemPadrao;
}