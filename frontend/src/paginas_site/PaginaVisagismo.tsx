import { LayoutSite } from "../componentes_site/LayoutSite";
import { FotoSite } from "../componentes_site/FotoSite";
import { linkAgendamento } from "../componentes_site/dadosSite";
import { IconeChevron, IconeMaisCirculo } from "../componentes_site/IconesSite";
import { ChaveImagem } from "../componentes_site/imagensSite";

const etapasConsultoria: { titulo: string; imagem: ChaveImagem }[] = [
    { titulo: "1. Análise da Coloração", imagem: "coloracao" },
    { titulo: "2. Estudo de Harmonias", imagem: "harmonias" },
    { titulo: "3. Escolha com Propósito", imagem: "escolha" },
];

export function PaginaVisagismo() {
    return (
        <LayoutSite titulo="Visagismo" cabecalho="sobreposto">
            {/* Topo com foto */}
            <section className="relative min-h-[640px] overflow-hidden bg-site-hero md:h-[734px]">
                <FotoSite chave="heroVisagismo" tom="escuro" prioritaria className="absolute inset-0 h-full w-full object-[72%_0%] md:object-[50%_0%]" />
                <div className="site-container relative pb-16 pt-[180px] text-white md:pt-[243px]">
                    <h1 className="text-[28px] font-bold md:text-[32px]">VISAGISMO</h1>
                    <p className="mt-[50px] font-comfortaa text-[28px] leading-[1.22] md:text-[32px]">
                        Óculos que
                        <br />
                        comunicam
                        <br />
                        quem você é.
                    </p>
                    <span className="site-barra site-barra-branca mt-[34px]" aria-hidden="true" />
                    <p className="mt-[40px] max-w-[470px] text-[15px] leading-[1.4] md:text-[16px]">
                        O Visagismo Óptico é uma metodologia que utiliza os óculos como ferramenta de comunicação da imagem pessoal.
                    </p>
                </div>
            </section>

            {/* Durante a análise */}
            <section className="relative overflow-hidden bg-[#fbf9f7] md:h-[533px]">
                <FotoSite chave="analise" className="h-[300px] w-full md:absolute md:inset-0 md:h-full" />
                <div className="site-container relative py-12 md:py-0">
                    <div className="md:ml-[363px] md:pt-[46px]">
                        <h2 className="text-[26px] font-bold leading-[1.2] md:text-[32px]">
                            Durante a Análise,
                            <br />
                            Observamos suas Características
                        </h2>
                        <p className="mt-[34px] font-comfortaa text-[18px] leading-[1.4] md:text-[20px]">
                            como formato facial,
                            <br />
                            proporções, contraste pessoal,
                            <br />
                            coloração, estilo, profissão,
                            <br />
                            personalidade e objetivos de imagem.
                        </p>
                    </div>
                </div>
            </section>

            {/* Sua imagem, traduzida em cada detalhe */}
            <section className="bg-black text-white">
                <div className="site-container grid gap-12 py-[76px] md:grid-cols-[281px_minmax(0,1fr)] md:gap-[119px] md:px-[167px]">
                    <FotoSite chave="detalhe" className="h-[372px] w-full rounded-[12px]" />
                    <div className="md:pt-[24px]">
                        <h2 className="text-[26px] font-bold leading-[1.2] md:text-[32px]">
                            Sua imagem, traduzida em
                            <br className="max-md:hidden" /> cada detalhe.
                        </h2>
                        <span className="site-barra site-barra-branca mt-[38px]" aria-hidden="true" />
                        <div className="mt-[44px] max-w-[540px] space-y-[17px] text-[13.5px] font-light leading-[1.55]">
                            <p>
                                O objetivo não é apenas encontrar um óculos que fique bonito, mas um modelo que represente quem você é e a
                                mensagem que deseja transmitir.
                            </p>
                            <p>
                                Um médico que busca mais autoridade, uma empresária que deseja transmitir confiança ou alguém que quer
                                mostrar mais leveza: cada objetivo pede uma armação diferente.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Como funciona a consultoria */}
            <section className="site-container pb-[90px] pt-[110px] text-center">
                <h2 className="site-titulo md:text-[35px]">Como funciona a consultoria</h2>
                <p className="mt-[20px] font-comfortaa text-[19px] md:text-[21px]">Elegância com Propósito</p>
                <span className="site-barra mx-auto mt-[38px]" aria-hidden="true" />
                <p className="site-texto mx-auto mt-[44px] max-w-[565px] text-[13.5px]">
                    Cada escolha é feita com base na sua personalidade, objetivos, estilo de vida, coloração pessoal e mensagem que deseja
                    transmitir.
                </p>
                <ul className="mx-auto mt-[36px] grid max-w-[696px] gap-8 sm:grid-cols-3 sm:gap-[21px]">
                    {etapasConsultoria.map((etapa) => (
                        <li key={etapa.titulo}>
                            <FotoSite chave={etapa.imagem} className="h-[232px] w-full rounded-[12px]" />
                            <p className="mt-[18px] text-[13.5px]">{etapa.titulo}</p>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Resultados que comunicam identidade */}
            <section className="bg-site-secao">
                <div className="site-container grid items-center gap-12 py-[96px] lg:grid-cols-[minmax(0,1fr)_auto] lg:pl-[180px] lg:pr-[170px]">
                    <div>
                        <h2 className="text-[26px] font-bold leading-[1.2] md:text-[32px]">
                            Resultados que
                            <br />
                            comunicam Identidade
                        </h2>
                        <p className="mt-[24px] font-comfortaa text-[19px] leading-[1.4] md:text-[21px]">
                            Pequenas mudanças,
                            <br />
                            grandes transformações.
                        </p>
                        <span className="site-barra mt-[22px]" aria-hidden="true" />
                        <p className="site-texto mt-[30px] max-w-[300px] text-[13.5px]">
                            A escolha certa de óculos pode realçar sua essência, reforçar sua autoridade e alinhar sua imagem aos seus
                            objetivos.
                        </p>
                        <a href={linkAgendamento} target="_blank" rel="noreferrer" className="site-botao-consultoria site-botao-consultoria-claro mt-[46px]">
                            Agende sua consultoria
                            <IconeMaisCirculo className="h-[24px] w-[24px]" />
                        </a>
                    </div>

                    <figure className="relative mx-auto w-fit pt-[38px]">
                        <figcaption className="absolute left-1/2 top-0 z-10 flex h-[47px] w-[300px] -translate-x-1/2 items-center justify-center rounded-full bg-black text-[13.5px] text-white sm:w-[372px]">
                            Alinhar sua imagem aos seus objetivos.
                        </figcaption>
                        <div className="relative flex gap-[22px]">
                            <FotoSite chave="antes" className="h-[290px] w-[150px] rounded-[12px] sm:h-[327px] sm:w-[211px]" />
                            <FotoSite chave="depois" className="h-[290px] w-[150px] rounded-[12px] sm:h-[327px] sm:w-[211px]" />
                            <span
                                className="absolute left-1/2 top-1/2 flex h-[64px] w-[64px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black"
                                aria-hidden="true"
                            >
                                <IconeChevron className="h-[26px] w-[26px]" />
                            </span>
                        </div>
                    </figure>
                </div>
            </section>

            {/* Visagismo óptico */}
            <section className="grid md:grid-cols-[minmax(0,730fr)_minmax(0,550fr)]">
                <div className="px-6 py-16 md:pb-[70px] md:pl-[108px] md:pr-[50px] md:pt-[80px]">
                    <h2 className="text-[28px] font-bold md:text-[32px]">Visagismo óptico</h2>
                    <p className="mt-[18px] max-w-[520px] font-comfortaa text-[19px] leading-[1.4] md:text-[21px]">
                        Transformando a compra de óculos em uma verdadeira consultoria de imagem.
                    </p>
                    <span className="site-barra mt-[34px]" aria-hidden="true" />
                    <p className="site-texto mt-[40px] max-w-[565px] text-[13.5px]">
                        Na Ótica Viser, o visagismo é aplicado para transformar a experiência de compra em uma verdadeira consultoria de
                        imagem para óculos, ajudando cada cliente a se enxergar com mais confiança, autenticidade e propósito.
                    </p>
                </div>
                <FotoSite chave="visagismoOptico" className="h-[360px] w-full md:h-full md:min-h-[520px]" />
            </section>
        </LayoutSite>
    );
}
