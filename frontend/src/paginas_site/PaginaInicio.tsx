import { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutSite } from "../componentes_site/LayoutSite";
import { FotoSite } from "../componentes_site/FotoSite";
import { LogoViser } from "../componentes_site/LogoViser";
import { CarrosselEstilos } from "../componentes_site/CarrosselEstilos";
import { FaixaDepoimentos } from "../componentes_site/FaixaDepoimentos";
import { cuidados, linkAgendamento } from "../componentes_site/dadosSite";
import {
    IconeEstrela,
    IconeFechar,
    IconeMaisCirculo,
    IconeMedalha,
    IconeOculos,
    IconePessoas,
    IconePlay,
    IconeSetaDireita,
} from "../componentes_site/IconesSite";

const diferenciais = [
    {
        icone: <IconeOculos className="h-[37px] w-[92px]" />,
        titulo: ["Especialista", "em Visagismo"],
        texto: "A Viser é uma ótica especializada em realçar a sua beleza e encontrar o óculos que combina com você.",
    },
    {
        icone: <IconePessoas className="h-[42px] w-[84px]" />,
        titulo: ["Atendimento", "personalizado"],
        texto: "Cada detalhe da sua experiência é pensado para que você se sinta única e especial.",
    },
    {
        icone: <IconeEstrela className="h-[46px] w-[48px]" />,
        titulo: ["Curadoria", "sofisticada"],
        texto: "Armações selecionadas das melhores marcas nacionais e internacionais.",
    },
    {
        icone: <IconeMedalha className="h-[45px] w-[32px]" />,
        titulo: ["Mais de 15 anos de", "experiência"],
        texto: "Tradição, conhecimento e paixão pelo que fazemos desde o primeiro dia",
    },
];

export function PaginaInicio() {
    const [videoAberto, definirVideoAberto] = useState(false);

    return (
        <LayoutSite titulo="Ótica e Visagismo" cabecalho="sobreposto" mostrarLogo={false}>
            {/* Topo com foto */}
            <section className="relative h-[620px] overflow-hidden bg-site-hero md:h-[806px]">
                <FotoSite chave="heroInicio" tom="escuro" prioritaria className="absolute inset-0 h-full w-full object-[71%_0%] md:object-[50%_0%]" />
                <div className="absolute inset-0 bg-black/30" aria-hidden="true" />

                {/* logo grande na vertical, lido de baixo para cima */}
                <div className="pointer-events-none absolute bottom-[26px] left-[14px] top-[104px] hidden md:block" aria-hidden="true">
                    <LogoViser vertical className="h-full w-auto text-[#b9b2ae]/85" />
                </div>

                <div className="site-container relative h-full">
                    <h1 className="absolute left-6 top-[150px] text-[30px] font-normal leading-[1] text-white md:left-[275px] md:top-[192px] md:text-[35px]">
                        Sua essência.
                        <br />
                        Seu estilo.
                    </h1>
                    <Link
                        to="/quem-somos"
                        className="absolute bottom-[92px] right-6 inline-flex h-[45px] items-center rounded-[8px] bg-white px-[11px] font-sans text-[16px] font-semibold text-black hover:bg-black hover:text-white transition-colors md:right-[140px]"
                    >
                        Conheça a Viser
                    </Link>
                </div>
            </section>

            {/* Visagismo em uma frase */}
            <section className="site-container pt-[83px] text-center">
                <p className="site-texto-comfortaa mx-auto max-w-[630px]">
                    O visagismo analisa o formato do rosto, traços físicos, personalidade e estilo de vida para encontrar a armação
                    perfeita e exclusiva.
                </p>
                <Link
                    to="/visagismo"
                    className="mx-auto mt-[38px] inline-flex items-center gap-[48px] font-sans text-[13.5px] font-bold uppercase hover:opacity-70 transition-opacity"
                >
                    <span className="border-b border-black/40 px-[26px] pb-[3px]">Saiba mais sobre visagismo</span>
                    <IconeSetaDireita className="h-[20px] w-[20px]" />
                </Link>
                <div className="mt-[52px]">
                    <a href={linkAgendamento} target="_blank" rel="noreferrer" className="site-botao-consultoria">
                        Agende sua consultoria
                        <IconeMaisCirculo className="h-[24px] w-[24px] text-[#6c6c6c]" />
                    </a>
                </div>
            </section>

            {/* Por que escolher a Viser? */}
            <section className="mx-auto mt-[83px] max-w-[1280px] px-4 md:px-[112px]">
                <div className="rounded-[15px] bg-black px-6 pb-[60px] pt-[48px] text-white md:px-[40px]">
                    <h2 className="text-center font-comfortaa text-[21px] font-medium">Por que escolher a Viser?</h2>
                    <p className="mt-[24px] text-center font-comfortaa text-[21px] font-medium">Uma experiência única em cada detalhe</p>

                    <ul className="mt-[42px] grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
                        {diferenciais.map((item, indice) => (
                            <li
                                key={item.titulo.join(" ")}
                                className={`flex flex-col items-center px-4 pt-[16px] text-center lg:min-h-[260px] lg:px-[26px] ${
                                    indice > 0 ? "lg:border-l-[3px] lg:border-white" : ""
                                }`}
                            >
                                <div className="flex h-[52px] items-center">{item.icone}</div>
                                <h3 className="mt-[28px] text-[16px] leading-[1.5]">
                                    {item.titulo[0]}
                                    <br />
                                    {item.titulo[1]}
                                </h3>
                                <p className="mt-[16px] text-[13.5px] leading-[1.6] text-white/95">{item.texto}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Encontre o seu estilo */}
            <section className="site-container pt-[110px]">
                <h2 className="text-[30px] font-bold leading-none md:text-[35px]">Encontre o seu estilo</h2>
                <p className="mt-[18px] text-right font-comfortaa text-[18px] md:text-[20px]">Armações a partir de R$299,00</p>
                <div className="mt-[24px]">
                    <CarrosselEstilos />
                </div>
            </section>

            {/* Vídeo */}
            <section className="site-container flex min-h-[210px] items-center justify-between gap-6 py-[60px] md:pt-[120px]">
                <h2 className="text-[26px] font-bold leading-[1.2] md:text-[32px]">
                    Estilo, personalidade e
                    <br />
                    sofisticação em destaque.
                </h2>
                <button
                    type="button"
                    onClick={() => definirVideoAberto(true)}
                    className="shrink-0 text-[#151515] hover:scale-105 transition-transform md:mr-[14px]"
                    aria-label="Assistir ao vídeo"
                >
                    <IconePlay className="h-[72px] w-[72px] md:h-[84px] md:w-[84px]" />
                </button>
            </section>

            {/* Cuide dos seus óculos */}
            <section className="bg-black text-white">
                <div className="site-container py-[66px] md:px-[139px]">
                    <h2 className="font-comfortaa text-[21px] font-medium">Cuide dos seus óculos</h2>
                    <p className="mt-[14px] text-[15px] font-light">O cuidado com sua visão começa nos detalhes.</p>
                    <ol className="mt-[18px] max-w-[1000px]">
                        {cuidados.map((cuidado, indice) => (
                            <li
                                key={cuidado}
                                className={`flex min-h-[55px] items-center gap-6 py-[10px] md:gap-0 ${
                                    indice < cuidados.length - 1 ? "border-b border-white" : ""
                                }`}
                            >
                                <span className="w-[22px] shrink-0 text-[18px] font-bold md:ml-[20px] md:w-[80px]">{indice + 1}.</span>
                                <span className="max-w-[820px] text-[13.5px] font-light leading-[1.45]">{cuidado}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Depoimentos */}
            <section className="site-container pb-[36px] pt-[58px]">
                <h2 className="text-[30px] font-bold md:text-[35px]">Depoimentos</h2>
                <div className="mt-[48px] md:mr-[110px]">
                    <FaixaDepoimentos />
                </div>
            </section>

            {videoAberto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Vídeo institucional"
                    onClick={() => definirVideoAberto(false)}
                >
                    <div className="relative w-full max-w-[880px]" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => definirVideoAberto(false)}
                            className="absolute -top-12 right-0 text-white hover:opacity-70"
                            aria-label="Fechar vídeo"
                        >
                            <IconeFechar className="h-8 w-8" />
                        </button>
                        {/* troque pelo <video> ou <iframe> do vídeo institucional quando ele existir */}
                        <FotoSite chave="capaVideo" tom="escuro" className="aspect-video w-full rounded-[12px]" />
                    </div>
                </div>
            )}
        </LayoutSite>
    );
}
