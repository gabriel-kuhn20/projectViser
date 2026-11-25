import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { calcularDataAlvoMarco, calcularMarcosAtingidos } from "../src/utilitarios_datas/CalculoMarcos";

// RNF01: popula o banco para o teste de carga do k6 (ListagemLembretes.js) com 5.000 clientes,
// uma entrega cada e os 5 atendentes que o script simula. Tudo leva o prefixo "Carga " no nome
// e o domínio @carga.local no e-mail, para o --limpar apagar só o que foi criado aqui.
// Uso: npm run carga:popular   |   npm run carga:limpar

const prisma = new PrismaClient();

const TOTAL_CLIENTES = 5000;
const TOTAL_ATENDENTES = 5;
const TAMANHO_LOTE = 1000;
const PREFIXO_NOME = "Carga ";
const DOMINIO_EMAIL = "@carga.local";
// mesma senha que o script do k6 usa por padrão; só vale para estas contas de teste
const SENHA_ATENDENTES = process.env.CARGA_SENHA ?? "carga12345";
const UM_DIA_EM_MS = 24 * 60 * 60 * 1000;

// entregas espalhadas pelos últimos 400 dias: todos os clientes já passaram do marco de 7 dias,
// então a lista do marco de 7 dias tem as 5.000 pendências — o pior caso para a listagem
function sortearDataEntrega(indiceCliente: number) {
  const diasAtras = 8 + (indiceCliente % 393);
  const dataEntrega = new Date(Date.now() - diasAtras * UM_DIA_EM_MS);
  dataEntrega.setUTCHours(0, 0, 0, 0);
  return dataEntrega;
}

async function popularAtendentes() {
  const senhaComHash = await bcrypt.hash(SENHA_ATENDENTES, 10);
  for (let numeroAtendente = 1; numeroAtendente <= TOTAL_ATENDENTES; numeroAtendente++) {
    const email = `atendente${numeroAtendente}${DOMINIO_EMAIL}`;
    const atendenteExistente = await prisma.usuario.findUnique({ where: { email } });
    if (atendenteExistente) continue;

    await prisma.usuario.create({
      data: { email, senha: senhaComHash, pessoa: { create: { nome: `${PREFIXO_NOME}Atendente ${numeroAtendente}` } } },
    });
  }
}

async function popularClientes() {
  const tiposMarcoAtivos = await prisma.tipoMarco.findMany({ where: { ativo: true } });
  const agora = new Date();

  // createManyAndReturn em lotes: 5.000 creates um por um levariam minutos
  for (let inicioLote = 0; inicioLote < TOTAL_CLIENTES; inicioLote += TAMANHO_LOTE) {
    const indicesLote = Array.from({ length: TAMANHO_LOTE }, (_, posicao) => inicioLote + posicao);

    const pessoasCriadas = await prisma.pessoa.createManyAndReturn({
      data: indicesLote.map((indiceCliente) => ({ nome: `${PREFIXO_NOME}Cliente ${indiceCliente + 1}` })),
    });
    const clientesCriados = await prisma.cliente.createManyAndReturn({
      data: pessoasCriadas.map((pessoaCriada, posicao) => ({
        pessoaId: pessoaCriada.id,
        contato: `5199${String(inicioLote + posicao).padStart(7, "0")}`,
      })),
    });
    const entregasCriadas = await prisma.entrega.createManyAndReturn({
      data: clientesCriados.map((clienteCriado, posicao) => ({
        clienteId: clienteCriado.id,
        dataEntrega: sortearDataEntrega(inicioLote + posicao),
        produto: "Armação de teste",
      })),
    });

    // mesmo cálculo da rotina de marcos (UC03), sem esperar o cron
    const dadosMarcos = entregasCriadas.flatMap((entregaCriada) =>
        calcularMarcosAtingidos(entregaCriada.dataEntrega, agora, tiposMarcoAtivos).map((tipoMarco) => ({
          entregaId: entregaCriada.id,
          tipoMarcoId: tipoMarco.id,
          dataAlvo: calcularDataAlvoMarco(entregaCriada.dataEntrega, tipoMarco.diasAposEntrega),
        }))
    );
    const marcosCriados = await prisma.marcoAcompanhamento.createManyAndReturn({ data: dadosMarcos });
    await prisma.lembrete.createMany({ data: marcosCriados.map((marcoCriado) => ({ marcoId: marcoCriado.id })) });

    console.log(`${inicioLote + indicesLote.length} de ${TOTAL_CLIENTES} clientes criados`);
  }
}

// ordem das exclusões: sempre das tabelas filhas para as pais, senão a chave estrangeira bloqueia
async function limparCarga() {
  const filtroPessoaCarga = { nome: { startsWith: PREFIXO_NOME } };
  const clientesCarga = await prisma.cliente.findMany({ where: { pessoa: filtroPessoaCarga }, select: { id: true } });
  const clienteIds = clientesCarga.map((clienteCarga) => clienteCarga.id);
  const filtroLembretesCarga = { marco: { entrega: { clienteId: { in: clienteIds } } } };
  const filtroUsuariosCarga = { email: { endsWith: DOMINIO_EMAIL } };

  await prisma.$transaction([
    prisma.emAtendimento.deleteMany({ where: { OR: [{ lembrete: filtroLembretesCarga }, { usuario: filtroUsuariosCarga }] } }),
    prisma.interacao.deleteMany({ where: { OR: [{ lembrete: filtroLembretesCarga }, { usuario: filtroUsuariosCarga }] } }),
    prisma.lembrete.deleteMany({ where: filtroLembretesCarga }),
    prisma.marcoAcompanhamento.deleteMany({ where: { entrega: { clienteId: { in: clienteIds } } } }),
    prisma.entrega.deleteMany({ where: { clienteId: { in: clienteIds } } }),
    prisma.clienteTag.deleteMany({ where: { clienteId: { in: clienteIds } } }),
    prisma.cliente.deleteMany({ where: { id: { in: clienteIds } } }),
    prisma.usuario.deleteMany({ where: filtroUsuariosCarga }),
    prisma.pessoa.deleteMany({ where: { ...filtroPessoaCarga, clientes: { none: {} }, usuario: null } }),
  ]);
  console.log(`dados de carga apagados (${clienteIds.length} clientes).`);
}

async function executarCarga() {
  if (process.argv.includes("--limpar")) {
    await limparCarga();
    return;
  }
  // roda de novo sem duplicar: limpa a carga anterior antes de recriar
  await limparCarga();
  await popularAtendentes();
  await popularClientes();
  console.log(`atendentes: atendente1${DOMINIO_EMAIL} a atendente${TOTAL_ATENDENTES}${DOMINIO_EMAIL}`);
}

executarCarga()
    .catch((erroCarga) => {
      console.error(erroCarga);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
