import { LayoutSite } from "../componentes_site/LayoutSite";
import { FotoSite } from "../componentes_site/FotoSite";
import { linkAgendamento, tendencias } from "../componentes_site/dadosSite";
import { IconeMaisCirculo } from "../componentes_site/IconesSite";
import { ChaveImagem } from "../componentes_site/imagensSite";

export function PaginaTendencias() {
    return (
        <LayoutSite titulo="Tendências" cabecalho="sobreposto">
            {/* Topo com foto */}
            <section className="relative min-h-[640px] overflow-hidden bg-site-hero md:h-[734px]">
                <FotoSite chave="heroTendencias" tom="escuro" prioritaria className="absolute inset-0 h-full w-full object-[74%_0%] md:object-[50%_0%]" />
                <div className="site-container relative pb-16 pt-[180px] text-white md:pt-[243px]">
                    <h1 className="text-[28px] font-bold md:text-[32px]">TENDÊNCIAS</h1>
                    <p className="mt-[50px] font-comfortaa text-[28px] leading-[1.22] md:text-[32px]">
                        O que está em alta
                        <br />
                        nas armações.
                    </p>
                    <span className="site-barra site-barra-branca mt-[34px]" aria-hidden="true" />
                    <p className="mt-[40px] max-w-[470px] text-[15px] leading-[1.4] md:text-[16px]">
                        Formatos, cores e materiais que estão chegando às vitrines, com o olhar do visagismo para você escolher o que
                        realmente combina com o seu estilo.
                    </p>
                </div>
            </section>

            {/* Lista de tendências */}
            <section className="site-container pb-[100px] pt-[90px]">
                <ul className="flex flex-col gap-[44px]">
                    {tendencias.map((tendencia) => (
                        <li
                            key={tendencia.nome}
                            className="flex flex-col gap-5 rounded-[14px] border-2 border-black p-5 sm:flex-row sm:items-center sm:gap-[40px] sm:py-[22px] sm:pl-[20px] sm:pr-[50px]"
                        >
                            <FotoSite
                                chave={tendencia.imagem as ChaveImagem}
                                ajuste="contain"
                                className="h-[165px] w-full shrink-0 bg-white sm:w-[220px]"
                            />
                            <div>
                                <h2 className="font-comfortaa text-[22px] font-medium uppercase md:text-[24px]">{tendencia.nome}</h2>
                                <p className="mt-[10px] max-w-[740px] text-[15px] leading-[1.4] md:text-[17px]">{tendencia.texto}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Chamada para a consultoria */}
            <section className="bg-black text-white">
                <div className="site-container flex flex-col gap-10 py-[76px] md:flex-row md:items-center md:justify-between">
                    <div className="max-w-[560px]">
                        <h2 className="font-comfortaa text-[20px] font-medium md:text-[22px]">Encontre a tendência que mais combina com você</h2>
                        <p className="mt-[34px] text-[13.5px] font-light leading-[1.5]">
                            Na Viser, acompanhamos as principais tendências do mercado para ajudar você a encontrar um modelo atual, mas que
                            também faça sentido para sua imagem e estilo de vida.
                        </p>
                    </div>
                    <a
                        href={linkAgendamento}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-[70px] w-fit shrink-0 items-center gap-[18px] rounded-full bg-white px-[32px] font-sans text-[15px] font-semibold uppercase text-black hover:bg-site-cabecalho transition-colors md:mr-[110px]"
                    >
                        Agende sua consultoria
                        <IconeMaisCirculo className="h-[22px] w-[22px]" />
                    </a>
                </div>
            </section>

            {/* Futuras tendências */}
            <section className="grid md:grid-cols-[minmax(0,740fr)_minmax(0,540fr)]">
                <div className="px-6 py-16 md:py-[110px] md:pl-[108px] md:pr-[60px]">
                    <h2 className="text-[30px] font-bold md:text-[35px]">Futuras Tendências</h2>
                    <div className="site-texto mt-[60px] max-w-[565px] space-y-[17px] text-[13.5px]">
                        <p>
                            As apostas são em modelagens fluidas, volumes leves e silhuetas estruturadas, criando looks que irão unir conforto
                            e sofisticação. Tecidos naturais, transparências e texturas marcantes deverão ganhar espaço, trazendo mais
                            movimento e personalidade às produções.
                        </p>
                        <p>
                            Nas cores, a aposta deverá transitar entre tons suaves e nuances vibrantes, enquanto estampas clássicas e detalhes
                            artesanais surgirão em releituras modernas.
                        </p>
                        <p>
                            Mais do que seguir tendências, a moda deverá valorizar peças que combinem estilo, praticidade e identidade,
                            refletindo uma expressão mais livre e versátil.
                        </p>
                    </div>
                </div>
                <div className="relative h-[420px] md:h-auto md:min-h-[570px]">
                    <FotoSite chave="futurasTendencias" className="absolute inset-0 h-full w-full" />
                </div>
            </section>
        </LayoutSite>
    );
}
