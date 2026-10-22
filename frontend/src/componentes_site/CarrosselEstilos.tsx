import { useState } from "react";
import { estilos } from "./dadosSite";
import { FotoSite } from "./FotoSite";
import { IconeTriangulo } from "./IconesSite";
import { ChaveImagem } from "./imagensSite";

const quantidadeVisivel = 3;

// "Encontre o seu estilo": mostra 3 estilos por vez e anda de um em um pelas setas
export function CarrosselEstilos() {
    const [inicio, definirInicio] = useState(0);
    const ultimoInicio = estilos.length - quantidadeVisivel;
    const visiveis = estilos.slice(inicio, inicio + quantidadeVisivel);

    return (
        <div>
            <ul className="grid gap-10 md:grid-cols-3 md:gap-[26px]">
                {visiveis.map((estilo) => (
                    <li key={estilo.nome}>
                        <FotoSite chave={estilo.imagem as ChaveImagem} className="h-[263px] w-full rounded-[12px]" />
                        <h3 className="mt-[24px] text-center text-[27px] font-normal leading-none">{estilo.nome}</h3>
                        <div className="site-texto mx-auto mt-[22px] max-w-[275px] text-[13.5px] leading-[1.5]">
                            <p>{estilo.descricao}</p>
                            <p className="mt-[17px]">{estilo.oculos}</p>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="mt-[64px] flex items-center justify-center gap-[340px] max-md:gap-24">
                <button
                    type="button"
                    onClick={() => definirInicio(Math.max(0, inicio - 1))}
                    disabled={inicio === 0}
                    className="text-[#151515] disabled:text-[#6b6565] hover:opacity-70 disabled:hover:opacity-100 transition-opacity"
                    aria-label="Estilos anteriores"
                >
                    <IconeTriangulo direcao="esquerda" className="h-[43px] w-[34px]" />
                </button>
                <button
                    type="button"
                    onClick={() => definirInicio(Math.min(ultimoInicio, inicio + 1))}
                    disabled={inicio === ultimoInicio}
                    className="text-[#151515] disabled:text-[#6b6565] hover:opacity-70 disabled:hover:opacity-100 transition-opacity"
                    aria-label="Próximos estilos"
                >
                    <IconeTriangulo className="h-[43px] w-[34px]" />
                </button>
            </div>
        </div>
    );
}
