import { imagensSite, ChaveImagem, ImagemSite } from "./imagensSite";

type PropriedadesFotoSite = {
    chave: ChaveImagem;
    className?: string;
    // tom do bloco provisório: claro em fundo branco, escuro em fundo preto/cinza
    tom?: "claro" | "escuro";
};

// Mostra a foto quando ela existir; até lá, um bloco cinza com a descrição
export function FotoSite({ chave, className = "", tom = "claro" }: PropriedadesFotoSite) {
    const imagem = imagensSite[chave] as ImagemSite;

    if (imagem.src) {
        return <img src={imagem.src} alt={imagem.descricao} className={`object-cover ${className}`} />;
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
