import { Link } from "react-router-dom";
import { LayoutSite } from "../componentes_site/LayoutSite";
import { FotoSite } from "../componentes_site/FotoSite";
import { linkAgendamento, tendencias } from "../componentes_site/dadosSite";
import { IconeMaisCirculo, IconeSetaDireita } from "../componentes_site/IconesSite";
import { ChaveImagem } from "../componentes_site/imagensSite";

// Página sem tela no Figma: segue a mesma linguagem visual de Visagismo e da Home
export function PaginaTendencias() {
    return (
        <LayoutSite titulo="Tendências" cabecalho="sobreposto">
            {/* Topo com foto */}
            <section className="relative min-h-[640px] overflow-hidden bg-site-hero md:h-[734px]">
                <FotoSite chave="heroTendencias" tom="escuro" className="absolute inset-0 h-full w-full" />
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

            {/* Armações da estação */}
            <section className="site-container pb-[100px] pt-[110px]">
                <div className="text-center">
                    <h2 className="site-titulo md:text-[35px]">As armações da estação</h2>
                    <p className="mt-[20px] font-comfortaa text-[19px] md:text-[21px]">Moda com identidade</p>
                    <span className="site-barra mx-auto mt-[38px]" aria-hidden="true" />
                    <p className="site-texto mx-auto mt-[44px] max-w-[565px] text-[13.5px]">
                        Selecionamos as tendências que mais aparecem na nossa curadoria. Cada uma conversa melhor com um estilo, e a
                        consultoria ajuda a encontrar a versão certa para o seu rosto.
                    </p>
                </div>

                <ul className="mt-[56px] grid gap-x-[26px] gap-y-[56px] sm:grid-cols-2 md:grid-cols-3">
                    {tendencias.map((tendencia) => (
                        <li key={tendencia.nome}>
                            <FotoSite chave={tendencia.imagem as ChaveImagem} className="h-[263px] w-full rounded-[12px]" />
                            <h3 className="mt-[24px] text-center text-[27px] font-normal leading-none">{tendencia.nome}</h3>
                            <div className="site-texto mx-auto mt-[22px] max-w-[275px] text-[13.5px] leading-[1.5]">
                                <p>{tendencia.resumo}</p>
                                <p className="mt-[17px]">{tendencia.combina}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Tendência com propósito */}
            <section className="bg-black text-white">
                <div className="site-container grid gap-12 py-[76px] md:grid-cols-[281px_minmax(0,1fr)] md:gap-[119px] md:px-[167px]">
                    <FotoSite chave="tendenciaDestaque" tom="escuro" className="h-[372px] w-full rounded-[12px]" />
                    <div className="md:pt-[24px]">
                        <h2 className="text-[26px] font-bold leading-[1.2] md:text-[32px]">
                            Tendência boa é a que
                            <br className="max-md:hidden" /> combina com você.
                        </h2>
                        <span className="site-barra site-barra-branca mt-[38px]" aria-hidden="true" />
                        <div className="mt-[44px] max-w-[540px] space-y-[17px] text-[13.5px] font-light leading-[1.55]">
                            <p>
                                Nem toda novidade funciona para todo rosto. Por isso, olhamos para formato facial, proporções e coloração
                                antes de indicar uma armação da moda.
                            </p>
                            <p>Assim, você usa o que está em alta sem perder a sua identidade.</p>
                        </div>
                        <Link
                            to="/visagismo"
                            className="mt-[40px] inline-flex items-center gap-[40px] font-sans text-[13.5px] font-bold uppercase hover:opacity-70 transition-opacity"
                        >
                            <span className="border-b border-white/50 pb-[3px] pr-[20px]">Saiba mais sobre visagismo</span>
                            <IconeSetaDireita className="h-[20px] w-[20px]" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Chamada para a consultoria */}
            <section className="bg-site-secao">
                <div className="site-container py-[96px] text-center">
                    <h2 className="text-[26px] font-bold leading-[1.2] md:text-[32px]">Qual tendência é a sua?</h2>
                    <p className="mt-[20px] font-comfortaa text-[19px] leading-[1.4] md:text-[21px]">
                        Descubra na consultoria de visagismo.
                    </p>
                    <span className="site-barra mx-auto mt-[30px]" aria-hidden="true" />
                    <div className="mt-[46px]">
                        <a href={linkAgendamento} target="_blank" rel="noreferrer" className="site-botao-consultoria">
                            Agende sua consultoria
                            <IconeMaisCirculo className="h-[24px] w-[24px] text-[#6c6c6c]" />
                        </a>
                    </div>
                </div>
            </section>
        </LayoutSite>
    );
}
