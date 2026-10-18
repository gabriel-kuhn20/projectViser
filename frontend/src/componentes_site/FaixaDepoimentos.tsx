import { depoimentos } from "./dadosSite";

// Faixa que desliza sozinha (para quando o mouse está em cima).
// A lista é repetida para o movimento não ter "pulo" no final.
export function FaixaDepoimentos() {
    const repetidos = [...depoimentos, ...depoimentos];

    return (
        <div className="site-faixa overflow-hidden">
            <ul className="site-faixa-trilho flex w-max gap-[45px]">
                {repetidos.map((depoimento, indice) => (
                    <li
                        key={`${depoimento.nome}-${indice}`}
                        aria-hidden={indice >= depoimentos.length}
                        className="h-[263px] w-[300px] shrink-0 rounded-[10px] border border-black px-[22px] pt-[24px] sm:w-[330px]"
                    >
                        <h3 className="text-[20px] font-bold">{depoimento.nome}</h3>
                        <p className="mt-[26px] text-[13.5px] font-light leading-[1.4]">{depoimento.texto}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
