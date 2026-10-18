// Conteúdo fixo do site institucional (textos do Figma)
// Contatos e endereços ficam aqui para serem trocados num lugar só

export const contatoViser = {
    telefone: "(51) 99964-5154",
    email: "viseroculos@gmail.com",
    // WhatsApp usa o mesmo número do telefone
    whatsapp: "https://wa.me/5551999645154",
    // TODO: confirmar o perfil oficial da Viser no Instagram
    instagram: "https://www.instagram.com/",
};

export const linkAgendamento = contatoViser.whatsapp;

export type Loja = {
    nome: string;
    cidade: string;
    endereco: string;
    observacao: string;
    mapa: string;
};

function linkMapa(endereco: string) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
}

export const lojas: Loja[] = [
    {
        nome: "Centro",
        cidade: "Centro - Lajeado / RS",
        endereco: "Av. Benjamin Constant, 1126 sala 408, Centro, Lajeado/RS",
        observacao: "Showroom aberto ao público.",
        mapa: linkMapa("Av. Benjamin Constant, 1126, Centro, Lajeado, RS"),
    },
    {
        nome: "São Cristóvão",
        cidade: "São Cristovão - Lajeado /RS",
        endereco: "Av. Piraí, 300, Bairro São Cristóvão, Lajeado/RS",
        observacao: "Somente com horário agendado",
        mapa: linkMapa("Av. Piraí, 300, São Cristóvão, Lajeado, RS"),
    },
];

export type DiaFuncionamento = { dia: string; horario: string[]; claro: boolean };

// a grade alterna claro/escuro como no Figma
export const horarios: DiaFuncionamento[] = [
    { dia: "Segunda", horario: ["08h30 às 18h"], claro: true },
    { dia: "Terça", horario: ["08h30 às 12h e", "das 13h30 às 18h"], claro: false },
    { dia: "Quarta", horario: ["08h30 às 18h"], claro: true },
    { dia: "Quinta", horario: ["08h30 às 12h e", "das 13h30 às 18h"], claro: false },
    { dia: "Sexta", horario: ["08h30 às 12h e", "das 13h30 às 18h"], claro: true },
    { dia: "Sábado", horario: ["Conforme", "agenda", "do mês"], claro: false },
];

export type Estilo = { nome: string; descricao: string; oculos: string; imagem: string };

export const estilos: Estilo[] = [
    {
        nome: "Clássico",
        descricao: "Elegante, atemporal e sofisticado. Peças que transmitem confiança através da discrição.",
        oculos: "Óculos ideais: retangulares, quadrados suaves e cores neutras.",
        imagem: "estiloClassico",
    },
    {
        nome: "Elegante",
        descricao: "Busca refinamento, credibilidade e uma imagem mais sofisticada.",
        oculos: "Óculos ideais: linhas bem definidas, acabamentos premium e tons sóbrios.",
        imagem: "estiloElegante",
    },
    {
        nome: "Criativo",
        descricao: "Gosta de originalidade, autenticidade e personalidade.",
        oculos: "Óculos ideais: formatos geométricos, cores diferenciadas e design marcante.",
        imagem: "estiloCriativo",
    },
    {
        nome: "Casual",
        descricao: "Valoriza praticidade, movimento e conforto no dia a dia.",
        oculos: "Óculos ideais: modelos leves, resistentes e funcionais.",
        imagem: "estiloCasual",
    },
    {
        nome: "Moderno",
        descricao: "Está sempre atento às tendências e gosta de transmitir atualização e inovação.",
        oculos: "Óculos ideais: formatos contemporâneos, oversized, transparentes ou geométricos.",
        imagem: "estiloModerno",
    },
];

export const cuidados = [
    "Nunca esfregue a sua lente à seco, em camisetas, por exemplo, pois o tecido pode arranhar a lente. Priorize sempre limpá-lo com água e sabão líquido neutro;",
    "Utilize lenços microfibra para limpar a lente sem danificá-la;",
    "Pegue os óculos pelas duas hastes, pois segurando apenas por uma pode entortar e afrouxar um dos lados;",
    "Não os deixe na cabeça, além de afrouxar e estragar as hastes, pode cair e quebrá-lo.",
];

// depoimentos exatamente como estão no Figma
export const depoimentos = [
    {
        nome: "Beatriz Rodrigues",
        texto: "Amei o atendimento de vocês. São muito diferenciadas. Fazem a gente se sentir segura e confiante na escolha. Obrigada pelas dicas.",
    },
    {
        nome: "Fernanda Moura",
        texto: "O atendimento é maravilhoso, me senti super à vontade, as gurias são super atenciosas. Fiquei encantada com a minha escolha, resolvi até usar mais óculos do que lente de contato.",
    },
    {
        nome: "Francielle Delavedova",
        texto: "Loja fora da curva! Além da consultoria de cores, as gurias entregam muitas opções e muito estilo em cada peça. Dá para ver a dedicação que elas têm em ajudar a gente a encontrar algo que realmente fique bom, combine com nossa personalidade e seja usado no dia a dia. Amo, indico e uso.",
    },
];

export const marcas = ["GUESS", "Calvin Klein", "MORENA ROSA", "SANTA LOLLA", "Lança perfume"];

export type Tendencia = { nome: string; resumo: string; combina: string; imagem: string };

export const tendencias: Tendencia[] = [
    {
        nome: "Oversized",
        resumo: "Armações maiores, que ganham presença no rosto e viram o centro do visual.",
        combina: "Combina com: quem gosta de ousar e quer óculos como acessório principal.",
        imagem: "tendenciaOversized",
    },
    {
        nome: "Transparentes",
        resumo: "Acetatos cristal e tons translúcidos, leves e fáceis de usar todos os dias.",
        combina: "Combina com: estilos moderno e casual, que pedem leveza.",
        imagem: "tendenciaTransparente",
    },
    {
        nome: "Gatinho",
        resumo: "O cat eye volta com cantos mais marcados e linhas alongadas.",
        combina: "Combina com: quem busca elegância com um toque retrô.",
        imagem: "tendenciaGatinho",
    },
    {
        nome: "Tartaruga",
        resumo: "O clássico mesclado ganha novas cores, do mel ao tartaruga escuro.",
        combina: "Combina com: estilos clássico e elegante, em qualquer formato.",
        imagem: "tendenciaTartaruga",
    },
    {
        nome: "Metal fino",
        resumo: "Hastes delicadas e aros finos em dourado ou prata, discretos e sofisticados.",
        combina: "Combina com: quem prefere um visual minimalista.",
        imagem: "tendenciaMetal",
    },
    {
        nome: "Geométricos",
        resumo: "Hexágonos, octógonos e recortes angulares para quem quer se destacar.",
        combina: "Combina com: o estilo criativo e personalidades marcantes.",
        imagem: "tendenciaGeometrico",
    },
];
