// Todas as fotos do site num lugar só.
// Enquanto `src` estiver vazio, a tela mostra um bloco cinza no lugar da foto.
// Para trocar: salve o arquivo em src/assets/site/, importe aqui e preencha o `src`.
// `posicao` define qual parte da foto aparece quando ela é recortada (CSS object-position).

import heroInicio from "../assets/site/hero-inicio.jpg";
import heroVisagismo from "../assets/site/hero-visagismo.jpg";
import heroTendencias from "../assets/site/hero-tendencias.jpg";
import estiloClassico from "../assets/site/estilo-classico.jpg";
import estiloElegante from "../assets/site/estilo-elegante.jpg";
import estiloCriativo from "../assets/site/estilo-criativo.jpg";
import estiloCasual from "../assets/site/estilo-casual.jpg";
import estiloModerno from "../assets/site/estilo-moderno.jpg";
import historia from "../assets/site/historia.jpg";
import experiencia from "../assets/site/experiencia.jpg";
import fundadoraBruna from "../assets/site/fundadora-bruna.jpg";
import analise from "../assets/site/analise.jpg";
import detalhe from "../assets/site/detalhe.jpg";
import coloracao from "../assets/site/coloracao.jpg";
import harmonias from "../assets/site/harmonias.jpg";
import escolha from "../assets/site/escolha.jpg";
import antes from "../assets/site/antes.jpg";
import depois from "../assets/site/depois.jpg";
import visagismoOptico from "../assets/site/visagismo-optico.jpg";
import lojaCentro from "../assets/site/loja-centro.jpg";
import lojaSaoCristovao from "../assets/site/loja-sao-cristovao.jpg";
import futurasTendencias from "../assets/site/futuras-tendencias.jpg";
import tendenciaGeometricos from "../assets/site/tendencia-geometricos.jpg";
import tendenciaOversized from "../assets/site/tendencia-oversized.jpg";
import tendenciaCosmeticas from "../assets/site/tendencia-cosmeticas.jpg";
import tendenciaMetalicos from "../assets/site/tendencia-metalicos.jpg";

export type ImagemSite = { src?: string; descricao: string; posicao?: string };

export const imagensSite = {
    // Início
    // os topos não têm `posicao`: o enquadramento muda entre celular e desktop e fica na className da página
    heroInicio: { src: heroInicio, descricao: "Mulher sorrindo e segurando uma armação, camisa azul" },
    estiloClassico: { src: estiloClassico, descricao: "Armação preta estilo browline sobre fundo branco", posicao: "50% 50%" },
    estiloElegante: { src: estiloElegante, descricao: "Armação tartaruga apoiada em degraus brancos", posicao: "50% 45%" },
    estiloCriativo: { src: estiloCriativo, descricao: "Armação de acetato cristal sobre fundo preto", posicao: "50% 50%" },
    estiloCasual: { src: estiloCasual, descricao: "Mãos segurando estojo aberto com óculos", posicao: "50% 50%" },
    estiloModerno: { src: estiloModerno, descricao: "Óculos de sol tartaruga sobre fundo preto", posicao: "50% 50%" },
    capaVideo: { descricao: "Capa do vídeo institucional" },

    // Quem somos
    historia: { src: historia, descricao: "Cliente sorrindo com óculos azul", posicao: "50% 20%" },
    experiencia: { src: experiencia, descricao: "Cliente segurando uma armação", posicao: "50% 25%" },
    fundadoras: { src: fundadoraBruna, descricao: "Bruna Lewis", posicao: "50% 22%" },
    lojaCentro: { src: lojaCentro, descricao: "Interior de ótica com expositores iluminados", posicao: "18% 50%" },
    lojaSaoCristovao: { src: lojaSaoCristovao, descricao: "Ótica com espelho redondo e prateleiras de armações", posicao: "50% 50%" },

    // Visagismo
    heroVisagismo: { src: heroVisagismo, descricao: "Mulher de blazer preto ajustando os óculos" },
    analise: { src: analise, descricao: "Cliente de perfil segurando uma armação", posicao: "0% 50%" },
    detalhe: { src: detalhe, descricao: "Armação gatinho lilás sobre bolsa preta da Viser", posicao: "50% 50%" },
    coloracao: { src: coloracao, descricao: "Cartela de cores da análise de coloração", posicao: "50% 50%" },
    harmonias: { src: harmonias, descricao: "Disco de harmonias de cores", posicao: "50% 45%" },
    escolha: { src: escolha, descricao: "Estudo de cores com armações", posicao: "50% 50%" },
    antes: { src: antes, descricao: "Cliente com armação branca (antes)", posicao: "50% 30%" },
    depois: { src: depois, descricao: "Cliente com armação escura (depois)", posicao: "50% 30%" },
    visagismoOptico: { src: visagismoOptico, descricao: "Armação tartaruga sobre bloco de pedra", posicao: "60% 50%" },

    // Tendências
    heroTendencias: { src: heroTendencias, descricao: "Mulher de colete preto sentada, com óculos tartaruga" },
    futurasTendencias: { src: futurasTendencias, descricao: "Mulher de colete caramelo ajustando os óculos", posicao: "50% 20%" },
    tendenciaGeometricos: { src: tendenciaGeometricos, descricao: "Armação tartaruga de recorte geométrico", posicao: "50% 50%" },
    tendenciaOversized: { src: tendenciaOversized, descricao: "Armação quadrada grande com lente rosa", posicao: "50% 50%" },
    tendenciaCosmeticas: { src: tendenciaCosmeticas, descricao: "Armação gatinho com lente azul clara", posicao: "50% 50%" },
    tendenciaMetalicos: { src: tendenciaMetalicos, descricao: "Armação de metal fino", posicao: "50% 50%" },
} satisfies Record<string, ImagemSite>;

export type ChaveImagem = keyof typeof imagensSite;
