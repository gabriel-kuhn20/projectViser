// Todas as fotos do site num lugar só.
// Enquanto `src` estiver vazio, a tela mostra um bloco cinza no lugar da foto.
// Para trocar: salve o arquivo em src/assets/site/, importe aqui e preencha o `src`.
//   import heroInicio from "../assets/site/hero-inicio.jpg";
//   heroInicio: { src: heroInicio, descricao: "..." },

export type ImagemSite = { src?: string; descricao: string };

export const imagensSite = {
    // Início
    heroInicio: { descricao: "Mulher ajustando os óculos, camisa azul" },
    estiloClassico: { descricao: "Mão segurando armação tartaruga clara" },
    estiloElegante: { descricao: "Óculos gatinho preto sobre mármore" },
    estiloCriativo: { descricao: "Estojo com armações coloridas e saquinho Viser" },
    estiloCasual: { descricao: "Mão segurando armação redonda tartaruga" },
    estiloModerno: { descricao: "Óculos de sol tartaruga sobre saquinho Viser" },
    capaVideo: { descricao: "Capa do vídeo institucional" },

    // Quem somos
    historia: { descricao: "Bruna e Daniela sorrindo, fundo branco" },
    experiencia: { descricao: "Bruna e Daniela de pé, fundo claro" },
    fundadoras: { descricao: "Bruna e Daniela rindo, fundo branco" },
    lojaCentro: { descricao: "Interior da loja do Centro" },
    lojaSaoCristovao: { descricao: "Interior da loja do São Cristóvão" },

    // Visagismo
    heroVisagismo: { descricao: "Mulher de blazer com óculos tartaruga vermelho" },
    analise: { descricao: "Perfil de cliente e mão segurando armação" },
    detalhe: { descricao: "Armação lilás sobre bolsa preta" },
    coloracao: { descricao: "Análise da coloração" },
    harmonias: { descricao: "Disco de harmonias de cores" },
    escolha: { descricao: "Cliente escolhendo armações" },
    antes: { descricao: "Cliente com armação branca (antes)" },
    depois: { descricao: "Cliente com armação escura (depois)" },
    visagismoOptico: { descricao: "Óculos tartaruga sobre pedra" },

    // Tendências
    heroTendencias: { descricao: "Modelo com óculos da estação" },
    tendenciaOversized: { descricao: "Armação oversized" },
    tendenciaTransparente: { descricao: "Armação transparente" },
    tendenciaGatinho: { descricao: "Armação gatinho" },
    tendenciaTartaruga: { descricao: "Armação tartaruga" },
    tendenciaMetal: { descricao: "Armação de metal fino" },
    tendenciaGeometrico: { descricao: "Armação geométrica" },
    tendenciaDestaque: { descricao: "Vitrine com a coleção da estação" },
} satisfies Record<string, ImagemSite>;

export type ChaveImagem = keyof typeof imagensSite;
