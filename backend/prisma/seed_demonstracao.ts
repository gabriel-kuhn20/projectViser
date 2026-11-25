import { Prisma, PrismaClient, TipoMarco } from "@prisma/client";
import bcrypt from "bcrypt";

// Dados de demonstração para a VM: clientes, compras, lembretes e histórico de contatos
// FICTÍCIOS, com cara de ótica real. Fica fora do seed.ts de propósito — o seed.ts roda em
// todo ambiente e isto aqui não pode cair no banco que a ótica for usar de verdade.
// Nenhum dado de cliente real da ótica entra aqui (LGPD).
//
// Pré-requisito: rodar antes o seed.ts (cria os tipos de marco 7 dias / 2 meses / 1 ano).
// Uso, dentro de backend/:  npx ts-node prisma/seed_demonstracao.ts

const prisma = new PrismaClient();

const UM_DIA_EM_MS = 24 * 60 * 60 * 1000;
const TOTAL_CLIENTES = 50;
// janela das compras: passa de 1 ano para o marco "1 ano" também aparecer
const DIAS_HISTORICO = 420;

const SENHA_ATENDENTES_DEMO = process.env.SEED_DEMO_SENHA ?? "Viser@2026";

// conta real de administrador da equipe: o e-mail existe de verdade, então a recuperação de senha
// (Resend) pode ser demonstrada com ele. Na VM, troque a senha pela variável de ambiente
const ADMIN_EQUIPE = {
  nome: "Gabriel Kuhn",
  email: "oticaviser.sistema@gmail.com",
  senha: process.env.SEED_ADMIN_EQUIPE_SENHA ?? "SenhaDoAdmin123",
};

// o e-mail da primeira atendente marca que a demonstração já foi aplicada: rodar de novo não duplica nada
const ATENDENTES_DEMO = [
  { nome: "Marina Schneider", email: "marina.schneider@oticaviser.com.br", ativo: true },
  { nome: "Juliana Hoffmann", email: "juliana.hoffmann@oticaviser.com.br", ativo: true },
  { nome: "Rafael Bergmann", email: "rafael.bergmann@oticaviser.com.br", ativo: true },
  // desativada: mostra que o histórico continua com o nome de quem atendeu
  { nome: "Patrícia Wolff", email: "patricia.wolff@oticaviser.com.br", ativo: false },
];

const NOMES_TAGS = ["Multifocal", "Lente de contato", "Cliente VIP", "Infantil", "Óculos de sol", "Convênio", "Indicação"];

const PRIMEIROS_NOMES = [
  "Ana", "Bruna", "Camila", "Daniela", "Eduarda", "Fernanda", "Gabriela", "Helena", "Isadora", "Júlia",
  "Larissa", "Luana", "Márcia", "Natália", "Patrícia", "Renata", "Sandra", "Tatiane", "Vanessa", "Elisa",
  "André", "Bruno", "Carlos", "Diego", "Eduardo", "Fábio", "Gustavo", "Henrique", "Igor", "João",
  "Leonardo", "Lucas", "Marcelo", "Mateus", "Paulo", "Ricardo", "Rodrigo", "Sérgio", "Tiago", "Vinícius",
];

const SOBRENOMES = [
  "Schmidt", "Müller", "Becker", "Klein", "Weber", "Fischer", "Wagner", "Schneider", "Kuhn", "Petry",
  "Silva", "Santos", "Oliveira", "Souza", "Pereira", "Costa", "Rodrigues", "Almeida", "Lima", "Ferreira",
  "Dalmoro", "Bertoldi", "Zanatta", "Fontana", "Bianchi", "Mallmann", "Heck", "Lorenzoni", "Rech", "Kunz",
];

const RUAS = [
  "Rua Bento Gonçalves", "Rua Júlio de Castilhos", "Av. Benjamin Constant", "Rua Silva Jardim",
  "Rua Borges de Medeiros", "Rua Tiradentes", "Av. Senador Alberto Pasqualini", "Rua 15 de Novembro",
  "Rua Osvaldo Aranha", "Rua São José", "Rua Pinheiro Machado", "Rua Carlos Spohr",
];

const BAIRROS_CIDADES = [
  "Centro, Lajeado", "Moinhos, Lajeado", "Florestal, Lajeado", "São Cristóvão, Lajeado", "Montanha, Lajeado",
  "Centro, Estrela", "Centro, Arroio do Meio", "Centro, Teutônia", "Centro, Encantado", "Centro, Cruzeiro do Sul",
  "Centro, Canudos do Vale", "Centro, Santa Clara do Sul",
];

// "ehSol" marca o produto que só recebe o contato de 7 dias (não tem lente de grau para acompanhar)
const PRODUTOS = [
  { descricao: "Armação Ray-Ban RB5154 + lentes multifocais Varilux", ehSol: false },
  { descricao: "Armação Oakley Pitchman + lentes antirreflexo", ehSol: false },
  { descricao: "Armação acetato preta + lentes visão simples com filtro azul", ehSol: false },
  { descricao: "Armação metal dourada + lentes multifocais Zeiss", ehSol: false },
  { descricao: "Armação infantil flexível + lentes policarbonato", ehSol: false },
  { descricao: "Armação Vogue VO5286 + lentes fotossensíveis Transitions", ehSol: false },
  { descricao: "Armação Tommy Hilfiger + lentes visão simples antirreflexo", ehSol: false },
  { descricao: "Lentes de contato Acuvue Oasys (caixa 6 un.)", ehSol: false },
  { descricao: "Lentes de contato tóricas Biofinity (caixa 3 un.)", ehSol: false },
  { descricao: "Troca de lentes na armação do cliente — multifocal", ehSol: false },
  { descricao: "Óculos de sol Ray-Ban Aviator", ehSol: true },
  { descricao: "Óculos de sol Oakley Holbrook polarizado", ehSol: true },
];

// textos do registro de contato por marco (chave = dias após a entrega)
const CONTEUDOS_POR_MARCO: Record<number, string[]> = {
  7: [
    "Liguei para saber da adaptação com os óculos novos.",
    "Mandei mensagem no WhatsApp perguntando como está a adaptação.",
    "Contato de 7 dias: perguntei sobre conforto da armação e nitidez.",
  ],
  60: [
    "Contato de 2 meses: perguntei se continua enxergando bem e se a armação precisa de ajuste.",
    "Mensagem no WhatsApp oferecendo limpeza e ajuste gratuitos.",
    "Liguei para acompanhar o uso das lentes depois de 2 meses.",
  ],
  365: [
    "Contato de 1 ano: lembrei que está na hora de refazer o exame de vista.",
    "Mensagem de 1 ano oferecendo revisão da receita e condição especial na troca das lentes.",
    "Liguei lembrando da consulta anual com o oftalmologista.",
  ],
};

const RESPOSTAS_CLIENTE = [
  "Está tudo ótimo, já se acostumou.",
  "Disse que no começo deu um pouco de tontura, mas já passou.",
  "Pediu para passar na loja para ajustar a haste.",
  "Agradeceu o contato, está enxergando muito bem.",
  "Vai marcar consulta e depois passa na loja.",
  "Reclamou que a armação aperta atrás da orelha — agendado ajuste.",
];

const TENTATIVA_SEM_RESPOSTA = "Tentei contato por telefone, não atendeu. Vou tentar de novo amanhã.";

// gerador pseudoaleatório com semente fixa: toda execução gera exatamente os mesmos dados,
// então a apresentação e o vídeo mostram sempre os mesmos clientes
function criarSorteador(semente: number) {
  let estado = semente;
  return () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let mistura = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    mistura = (mistura + Math.imul(mistura ^ (mistura >>> 7), 61 | mistura)) ^ mistura;
    return ((mistura ^ (mistura >>> 14)) >>> 0) / 4294967296;
  };
}

const sortear = criarSorteador(20261123);

function sortearInteiro(minimo: number, maximo: number) {
  return minimo + Math.floor(sortear() * (maximo - minimo + 1));
}

function sortearItem<TipoItem>(lista: TipoItem[]): TipoItem {
  return lista[Math.floor(sortear() * lista.length)];
}

function sortearChance(probabilidade: number) {
  return sortear() < probabilidade;
}

function somarDias(data: Date, dias: number) {
  return new Date(data.getTime() + dias * UM_DIA_EM_MS);
}

// horário comercial: uma entrega às 3h da manhã denunciaria que o dado é gerado.
// Em UTC porque o relógio da VM pode não estar em Brasília: 12h–20h UTC = 9h–17h em Brasília
function gerarDataEntrega(agora: Date) {
  const dataEntrega = somarDias(agora, -sortearInteiro(1, DIAS_HISTORICO));
  dataEntrega.setUTCHours(sortearInteiro(12, 20), sortearInteiro(0, 59), 0, 0);
  return dataEntrega;
}

// nomes sem repetir: dois "Lucas Schmidt" na lista confundiriam a demonstração da busca
function gerarNomesUnicos(quantidade: number) {
  const nomesGerados = new Set<string>();
  while (nomesGerados.size < quantidade) {
    nomesGerados.add(`${sortearItem(PRIMEIROS_NOMES)} ${sortearItem(SOBRENOMES)}`);
  }
  return [...nomesGerados];
}

function gerarTelefone() {
  return `(51) 9${sortearInteiro(8000, 9999)}-${sortearInteiro(1000, 9999)}`;
}

function gerarEndereco() {
  return `${sortearItem(RUAS)}, ${sortearInteiro(10, 2500)} - ${sortearItem(BAIRROS_CIDADES)}`;
}

async function main() {
  // antes da checagem de "já aplicada": a conta do admin precisa existir mesmo onde a demonstração já rodou
  await garantirAdminEquipe();

  const demonstracaoJaAplicada = await prisma.usuario.findUnique({ where: { email: ATENDENTES_DEMO[0].email } });
  if (demonstracaoJaAplicada) {
    console.log("Dados de demonstração já existem — nada foi alterado.");
    return;
  }

  const tiposMarco = await prisma.tipoMarco.findMany({ where: { ativo: true } });
  if (tiposMarco.length === 0) {
    throw new Error("nenhum tipo de marco ativo — rode o seed.ts antes deste script");
  }

  // tudo ou nada: se falhar no meio, o banco não fica com metade da demonstração
  await prisma.$transaction(
      async (transacao) => {
        const idsAtendentes = await criarAtendentes(transacao);
        const idsTags = await criarTags(transacao);
        await criarClientesComHistorico(transacao, tiposMarco, idsAtendentes, idsTags);
        await marcarLembretesEmAtendimento(transacao, idsAtendentes.ativos);
      },
      { timeout: 120_000 }
  );

  console.log(`Demonstração criada: ${TOTAL_CLIENTES} clientes. Senha das atendentes: ${SENHA_ATENDENTES_DEMO}`);
}

// já existe (ex: criada pela tela de atendentes): só garante o papel de admin, sem mexer na senha
// que a pessoa pode ter trocado depois
async function garantirAdminEquipe() {
  const usuarioExistente = await prisma.usuario.findUnique({ where: { email: ADMIN_EQUIPE.email } });
  if (usuarioExistente) {
    await prisma.usuario.update({ where: { id: usuarioExistente.id }, data: { papelAcesso: "admin", ativo: true } });
    console.log(`Admin ${ADMIN_EQUIPE.email} já existia — papel garantido como admin.`);
    return;
  }

  await prisma.usuario.create({
    data: {
      email: ADMIN_EQUIPE.email,
      senha: await bcrypt.hash(ADMIN_EQUIPE.senha, 10),
      papelAcesso: "admin",
      pessoa: { create: { nome: ADMIN_EQUIPE.nome, email: ADMIN_EQUIPE.email } },
    },
  });
  console.log(`Admin ${ADMIN_EQUIPE.email} criado.`);
}

async function criarAtendentes(transacao: Prisma.TransactionClient) {
  const senhaComHash = await bcrypt.hash(SENHA_ATENDENTES_DEMO, 10);
  const ativos: number[] = [];
  const inativos: number[] = [];

  for (const atendente of ATENDENTES_DEMO) {
    const usuarioCriado = await transacao.usuario.create({
      data: {
        email: atendente.email,
        senha: senhaComHash,
        papelAcesso: "atendente",
        ativo: atendente.ativo,
        pessoa: { create: { nome: atendente.nome, email: atendente.email } },
      },
    });
    (atendente.ativo ? ativos : inativos).push(usuarioCriado.id);
  }

  return { ativos, inativos };
}

async function criarTags(transacao: Prisma.TransactionClient) {
  const idsTags: number[] = [];
  for (const nomeTag of NOMES_TAGS) {
    // tag com o mesmo nome já cadastrada pela equipe é reaproveitada, para a lista não ficar duplicada
    const tagExistente = await transacao.tag.findFirst({ where: { nome: nomeTag } });
    const tag = tagExistente ?? (await transacao.tag.create({ data: { nome: nomeTag } }));
    idsTags.push(tag.id);
  }
  return idsTags;
}

async function criarClientesComHistorico(
    transacao: Prisma.TransactionClient,
    tiposMarco: TipoMarco[],
    idsAtendentes: { ativos: number[]; inativos: number[] },
    idsTags: number[]
) {
  const agora = new Date();
  // marcos que o óculos de sol não recebe: todos menos o mais curto
  const menorPrazo = Math.min(...tiposMarco.map((tipoMarco) => tipoMarco.diasAposEntrega));
  const idsMarcosIgnoradosSol = tiposMarco
      .filter((tipoMarco) => tipoMarco.diasAposEntrega !== menorPrazo)
      .map((tipoMarco) => tipoMarco.id);

  for (const nomeCliente of gerarNomesUnicos(TOTAL_CLIENTES)) {
    // ~35% voltou para uma segunda compra e ~10% para uma terceira
    const totalCompras = sortearChance(0.1) ? 3 : sortearChance(0.35) ? 2 : 1;
    const datasEntrega = Array.from({ length: totalCompras }, () => gerarDataEntrega(agora));
    // "cliente desde" é a primeira compra — com o padrão now() todos apareciam como cadastrados hoje
    const clienteDesde = new Date(Math.min(...datasEntrega.map((dataEntrega) => dataEntrega.getTime())));

    const cliente = await transacao.cliente.create({
      data: {
        contato: gerarTelefone(),
        // nem todo cliente informa endereço no balcão
        endereco: sortearChance(0.8) ? gerarEndereco() : null,
        criadoEm: clienteDesde,
        pessoa: { create: { nome: nomeCliente, criadoEm: clienteDesde } },
      },
    });

    await vincularTagsSorteadas(transacao, cliente.id, idsTags);

    for (const dataEntrega of datasEntrega) {
      const produto = sortearItem(PRODUTOS);
      const entrega = await transacao.entrega.create({
        data: {
          clienteId: cliente.id,
          dataEntrega,
          produto: produto.descricao,
          tiposMarcoIgnorados: produto.ehSol ? idsMarcosIgnoradosSol : [],
        },
      });
      await criarMarcosDaEntrega(transacao, entrega, tiposMarco, idsAtendentes, agora);
    }
  }
}

async function vincularTagsSorteadas(transacao: Prisma.TransactionClient, clienteId: number, idsTags: number[]) {
  const quantidadeTags = sortearInteiro(0, 2);
  const tagsSorteadas = new Set<number>();
  while (tagsSorteadas.size < quantidadeTags) {
    tagsSorteadas.add(sortearItem(idsTags));
  }
  for (const tagId of tagsSorteadas) {
    await transacao.clienteTag.create({ data: { clienteId, tagId } });
  }
}

// mesma conta do AgendadorMarcos (dataAlvo = entrega + dias do marco), feita aqui para já
// gravar o histórico do contato. Ao subir, o agendador vê os marcos existentes e não duplica
async function criarMarcosDaEntrega(
    transacao: Prisma.TransactionClient,
    entrega: { id: number; dataEntrega: Date; tiposMarcoIgnorados: number[] },
    tiposMarco: TipoMarco[],
    idsAtendentes: { ativos: number[]; inativos: number[] },
    agora: Date
) {
  for (const tipoMarco of tiposMarco) {
    if (entrega.tiposMarcoIgnorados.includes(tipoMarco.id)) continue;

    const dataAlvo = somarDias(entrega.dataEntrega, tipoMarco.diasAposEntrega);
    if (dataAlvo > agora) continue; // marco ainda não venceu

    const diasDesdeAlvo = (agora.getTime() - dataAlvo.getTime()) / UM_DIA_EM_MS;
    // marco recente fica pendente (é o que a atendente tem para fazer hoje); dos antigos,
    // alguns ficam esquecidos para a lista "quem espera há mais tempo" ter o que mostrar
    const concluido = diasDesdeAlvo > 5 && sortearChance(0.88);

    const marco = await transacao.marcoAcompanhamento.create({
      data: {
        entregaId: entrega.id,
        tipoMarcoId: tipoMarco.id,
        dataAlvo,
        criadoEm: dataAlvo,
      },
    });

    if (!concluido) {
      await transacao.lembrete.create({ data: { marcoId: marco.id, criadoEm: dataAlvo } });
      continue;
    }

    // contato feito entre o dia do marco e 4 dias depois; como só conclui marco com mais de 5 dias,
    // a data nunca passa de hoje
    const diasAteContato = sortearInteiro(0, 4);
    const concluidoEm = new Date(somarDias(dataAlvo, diasAteContato).getTime() + sortearInteiro(10, 180) * 60_000);
    const lembrete = await transacao.lembrete.create({
      data: { marcoId: marco.id, status: "concluido", criadoEm: dataAlvo, concluidoEm },
    });
    await criarInteracoesDoLembrete(transacao, lembrete.id, tipoMarco, idsAtendentes, diasAteContato, concluidoEm, diasDesdeAlvo);
  }
}

async function criarInteracoesDoLembrete(
    transacao: Prisma.TransactionClient,
    lembreteId: number,
    tipoMarco: TipoMarco,
    idsAtendentes: { ativos: number[]; inativos: number[] },
    diasAteContato: number,
    concluidoEm: Date,
    diasDesdeAlvo: number
) {
  // a atendente desativada saiu há uns 4 meses: só aparece nos contatos mais antigos
  const podeSerInativa = diasDesdeAlvo > 120 && idsAtendentes.inativos.length > 0;
  const usuarioId = podeSerInativa && sortearChance(0.4)
      ? sortearItem(idsAtendentes.inativos)
      : sortearItem(idsAtendentes.ativos);

  // ~20% precisou de uma tentativa antes de conseguir falar com o cliente
  // só cabe quando o contato saiu pelo menos 1 dia depois do marco
  if (diasAteContato >= 1 && sortearChance(0.2)) {
    await transacao.interacao.create({
      data: { lembreteId, usuarioId, conteudo: TENTATIVA_SEM_RESPOSTA, criadoEm: somarDias(concluidoEm, -1) },
    });
  }

  // marco criado pelo admin com prazo fora dos três padrões usa um texto genérico
  const conteudos = CONTEUDOS_POR_MARCO[tipoMarco.diasAposEntrega] ?? [`Contato de ${tipoMarco.nome} com o cliente.`];
  await transacao.interacao.create({
    data: {
      lembreteId,
      usuarioId,
      conteudo: sortearItem(conteudos),
      respostaCliente: sortearChance(0.85) ? sortearItem(RESPOSTAS_CLIENTE) : null,
      criadoEm: concluidoEm,
    },
  });
}

// dois lembretes pendentes já "pegos" por atendentes diferentes, para mostrar o aviso de em atendimento
async function marcarLembretesEmAtendimento(transacao: Prisma.TransactionClient, idsAtendentesAtivos: number[]) {
  const lembretesPendentes = await transacao.lembrete.findMany({
    // sem o filtro, um lembrete de teste que já está em atendimento quebraria o @unique de lembreteId
    where: { status: "pendente", emAtendimentos: { is: null } },
    orderBy: { criadoEm: "desc" },
    take: 2,
  });

  for (const [posicao, lembrete] of lembretesPendentes.entries()) {
    await transacao.emAtendimento.create({
      data: { lembreteId: lembrete.id, usuarioId: idsAtendentesAtivos[posicao % idsAtendentesAtivos.length] },
    });
  }
}

main()
    .catch((erro) => {
      console.error(erro);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
