import { LayoutSite } from "../componentes_site/LayoutSite";
import { FotoSite } from "../componentes_site/FotoSite";
import { lojas } from "../componentes_site/dadosSite";
import { ChaveImagem } from "../componentes_site/imagensSite";

// Provisório: nomes das marcas escritos com fontes parecidas até os logos serem exportados do Figma
const marcasCuradoria = [
    { nome: "GUESS", classe: "font-display text-[31px] font-semibold tracking-[0.02em]" },
    { nome: "Calvin Klein", classe: "font-sans text-[27px] font-normal tracking-[-0.03em]" },
    { nome: "MORENA ROSA", classe: "font-montserrat text-[24px] font-bold" },
    { nome: "SANTA LOLLA", classe: "font-sans text-[26px] font-light tracking-[0.04em] [transform:scaleX(0.72)]" },
    { nome: "Lança perfume", classe: "font-sans text-[31px] font-light tracking-[-0.02em] [transform:scaleX(0.78)]" },
];

const fotosLojas: ChaveImagem[] = ["lojaCentro", "lojaSaoCristovao"];

const marcosHistoria = [
    { ano: "2022", texto: "Início dos atendimentos personalizados e domiciliares." },
    { ano: "2023", texto: "Inauguração do primeiro espaço físico da Viser." },
    { ano: "2024", texto: "Expansão para duas unidades e rebranding da marca." },
];

export function PaginaQuemSomos() {
    return (
        <LayoutSite titulo="Quem somos" cabecalho="claro">
            {/* Conheça nossa história */}
            <section className="pt-[80px] text-center">
                <h1 className="site-titulo md:text-[35px]">Conheça nossa história</h1>
                <p className="mt-[22px] font-comfortaa text-[18px] md:text-[21px]">Visagismo, Identidade e Sofisticação</p>
            </section>

            <section className="mt-[48px] grid md:grid-cols-[minmax(0,558fr)_minmax(0,722fr)]">
                <FotoSite chave="historia" className="h-[420px] w-full md:h-[574px]" />
                <div className="flex flex-col justify-center px-6 py-12 md:pl-[50px] md:pr-[108px]">
                    <h2 className="text-[28px] font-bold md:text-[32px]">A Essência da Viser</h2>
                    <span className="site-barra mt-[44px]" aria-hidden="true" />
                    <div className="site-texto mt-[52px] max-w-[565px] space-y-[17px] text-[13.5px]">
                        <p>
                            Na Ótica Viser, acreditamos que os óculos vão além da visão, representam identidade e estilo. Por isso,
                            oferecemos uma experiência personalizada e acolhedora, valorizando a beleza e a essência de cada cliente.
                        </p>
                        <p>
                            A trajetória da Viser é resultado da paixão e da experiência de Bruna Lewis, que soma mais de 15 anos de
                            atuação no mercado óptico, incluindo uma década de experiência da indústria.
                        </p>
                        <p>
                            Ao lado de Daniela Mallmann, Bruna transformou conhecimento técnico e sensibilidade estética em um negócio
                            que une saúde visual, moda e consultoria especializada.
                        </p>
                    </div>
                </div>
            </section>

            {/* 15 anos de experiência */}
            <section className="grid md:grid-cols-[minmax(0,660fr)_minmax(0,620fr)]">
                <div className="bg-site-bege px-6 py-16 md:pb-[90px] md:pl-[108px] md:pr-[60px] md:pt-[120px]">
                    <h2 className="text-[30px] font-bold md:text-[35px]">15 anos de experiência</h2>
                    <span className="site-barra mt-[44px]" aria-hidden="true" />
                    <div className="site-texto mt-[60px] max-w-[490px] space-y-[17px] text-[13.5px]">
                        <p>Hoje, a Ótica Viser conta com duas lojas em Lajeado.</p>
                        <p>
                            A unidade do Centro, localizada na Avenida Benjamin Constant, 1126, sala 408, atende tanto clientes agendados
                            quanto aqueles que preferem a praticidade do atendimento espontâneo.
                        </p>
                        <p>
                            Já a unidade do bairro São Cristóvão funciona exclusivamente com hora marcada, proporcionando uma experiência
                            ainda mais reservada e personalizada.
                        </p>
                        <p>
                            Nosso objetivo é ajudar cada cliente a encontrar a combinação ideal entre conforto, qualidade e estilo. Sempre
                            com um preço justo e produtos diferenciados, muitos deles artesanais e exclusivos, pensados para quem busca
                            autenticidade e sofisticação.
                        </p>
                    </div>
                </div>
                <FotoSite chave="experiencia" className="h-[420px] w-full md:h-full md:min-h-[683px] md:border-l md:border-black/20" />
            </section>

            {/* 3 anos de Viser */}
            <section className="pt-[60px]">
                <h2 className="site-container text-[30px] font-bold md:text-[35px]">3 anos de Viser</h2>
                <div className="relative mt-[36px]">
                    <span className="absolute inset-x-0 top-0 h-[2px] bg-black" aria-hidden="true" />
                    <ol className="site-container flex flex-col gap-10 md:flex-row md:gap-[10px]">
                        {marcosHistoria.map((marco) => (
                            <li key={marco.ano} className="relative pt-[24px] text-center md:w-[300px] md:first:ml-[92px]">
                                <span
                                    className="absolute left-1/2 top-[-5px] hidden h-[12px] w-[12px] -translate-x-1/2 rounded-full bg-black md:block"
                                    aria-hidden="true"
                                />
                                <strong className="block text-[25px] font-bold leading-none">{marco.ano}</strong>
                                <p className="mx-auto mt-[14px] max-w-[270px] text-[16px] leading-[1.3]">{marco.texto}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Fundadoras */}
            <section className="mt-[110px] bg-[#f8f8f8]">
                <div className="site-container grid gap-10 pt-[80px] md:grid-cols-[minmax(0,1fr)_420px] md:items-end md:gap-16 lg:grid-cols-[minmax(0,1fr)_460px]">
                    <div className="max-w-[340px] md:pb-[80px]">
                        <h2 className="text-[30px] font-bold md:text-[35px]">Bruna Lewis</h2>
                        <span className="site-barra mt-[24px]" aria-hidden="true" />
                        <p className="site-texto mt-[34px] text-[13.5px]">
                            Soma 15 anos de atuação no mercado óptico, incluindo uma década de experiência em laboratório óptico como
                            Gestora da área oftalmológica e é Visagista Óptica.
                        </p>

                        <h2 className="mt-[56px] text-[30px] font-bold md:text-[35px]">Daniela Mallmann</h2>
                        <span className="site-barra mt-[24px]" aria-hidden="true" />
                        <p className="site-texto mt-[34px] text-[13.5px]">
                            Possui mais de 20 anos de experiência em vendas e relacionamento com pessoas, além de formação técnica em
                            Óptica.
                        </p>
                    </div>
                    {/* foto em pé (retrato), alinhada ao conteúdo e encostada no fim da seção */}
                    <FotoSite chave="fundadoras" className="h-[480px] w-full md:h-[560px]" />
                </div>
            </section>

            {/* Marcas */}
            <section className="bg-black px-6 pb-[64px] pt-[64px] text-center text-white">
                <h2 className="text-[19px] uppercase md:text-[21px]">Marcas que fazem parte da nossa curadoria</h2>
                <ul className="mt-[40px] flex flex-wrap items-center justify-center gap-x-[22px] gap-y-4">
                    {marcasCuradoria.map((marca) => (
                        <li key={marca.nome} className={`inline-block leading-none ${marca.classe}`}>
                            {marca.nome}
                        </li>
                    ))}
                </ul>
                <p className="mx-auto mt-[48px] max-w-[420px] text-[13.5px] font-light leading-[1.5]">
                    Selecionamos marcas que unem design, autenticidade e sofisticação para diferentes estilos e personalidades.
                </p>
            </section>

            {/* Lojas */}
            <section className="site-container pb-[86px] pt-[100px]">
                <h2 className="text-center text-[26px] font-bold md:text-[32px]">Encontre a VISER mais perto de você.</h2>
                <ul className="mt-[40px] grid gap-12 md:grid-cols-2 md:gap-[30px] lg:px-0">
                    {lojas.map((loja, indice) => (
                        <li key={loja.nome} className="grid gap-[24px] sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:gap-[38px]">
                            <FotoSite chave={fotosLojas[indice]} className="h-[260px] w-full rounded-[25px] md:h-[311px]" />
                            <div className="flex flex-col gap-6 sm:gap-0 sm:pt-[24px]">
                                <h3 className="max-w-[215px] text-[18px] uppercase leading-[1.4] md:text-[21px]">{loja.cidade}</h3>
                                <p className="mt-[20px] max-w-[210px] text-[13.5px] leading-[1.45]">{loja.endereco}</p>
                                <a href={loja.mapa} target="_blank" rel="noreferrer" className="site-botao-contorno mt-auto w-fit">
                                    Ver localização
                                </a>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        </LayoutSite>
    );
}
