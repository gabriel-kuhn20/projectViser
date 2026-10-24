import { ReactNode } from "react";

type PropriedadesTituloPagina = {
    titulo: string;
    subtitulo?: ReactNode;
    // ação ao lado do título (ex.: botão "Novo cliente")
    acao?: ReactNode;
};

// Título das telas internas no padrão do site: título em negrito, subtítulo em Comfortaa e barra preta
export function TituloPagina({ titulo, subtitulo, acao }: PropriedadesTituloPagina) {
    return (
        <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="pagina-titulo">{titulo}</h1>
                    {subtitulo && <p className="pagina-subtitulo">{subtitulo}</p>}
                </div>
                {acao}
            </div>
            <span className="pagina-barra" aria-hidden="true" />
        </div>
    );
}
