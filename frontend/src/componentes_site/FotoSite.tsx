import { imagensSite, ChaveImagem, ImagemSite } from "./imagensSite";

type PropriedadesFotoSite = {
    chave: ChaveImagem;
    className?: string;
    // tom do bloco provisório: claro em fundo branco, escuro em fundo preto/cinza
    tom?: "claro" | "escuro";
    // fotos do topo da página carregam na hora; as demais só quando chegam perto da tela
    prioritaria?: boolean;
    // contain: mostra a foto inteira (óculos em fundo branco), cover: preenche e recorta
    ajuste?: "cover" | "contain";
};

// Mostra a foto quando ela existir; até lá, um bloco cinza com a descrição
export function FotoSite({ chave, className = "", tom = "claro", prioritaria = false, ajuste = "cover" }: PropriedadesFotoSite) {
    const imagem = imagensSite[chave] as ImagemSite;

    if (imagem.src) {
        return (
            <img
                src={imagem.src}
                alt={imagem.descricao}
                loading={prioritaria ? "eager" : "lazy"}
                decoding="async"
                style={imagem.posicao ? { objectPosition: imagem.posicao } : undefined}
                className={`${ajuste === "contain" ? "object-contain" : "object-cover"} ${className}`}
            />
        );
    }

    return (
        <div
            role="img"
            aria-label={imagem.descricao}
            className={`site-foto-provisoria ${tom === "escuro" ? "site-foto-provisoria-escura" : ""} ${className}`}
        >
            <span>{imagem.descricao}</span>
        </div>
    );
}
