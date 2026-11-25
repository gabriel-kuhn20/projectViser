// Suporte dos testes BDD: sobe a API de verdade, uma vez por execução,
// contra um schema só de teste no PostgreSQL. Nenhum mock: o teste atravessa
// Express, JWT e Prisma até o banco, e o schema de teste vai fora no fim.
import { AfterAll, Before, BeforeAll, setDefaultTimeout } from "@cucumber/cucumber";
import { execSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import type { PrismaClient } from "@prisma/client";

const backend = join(__dirname, "..", "..");
const SCHEMA_TESTE = "teste_bdd";

// Antes de qualquer import da API: o banco é o mesmo do .env, mas os testes
// usam outro schema, então os dados de desenvolvimento nunca são encostados.
// Na CI não existe .env: o valor padrão é o do docker-compose.yml.
dotenv.config({ path: join(backend, ".env") });
const urlBanco = new URL(
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/pos_venda_otica"
);
urlBanco.searchParams.set("schema", SCHEMA_TESTE);
process.env.DATABASE_URL = urlBanco.toString();
process.env.JWT_SEGREDO ??= "segredo-so-dos-testes";
process.env.NODE_ENV = "test";

// teste nunca manda e-mail de verdade: sem chave, o EnviadorEmail cai no console.
// O .env carregado acima pode ter a chave do Resend, e aí cada execução gastaria cota
// e registraria falhas no painel, porque o destinatário dos cenários não é a caixa da conta.
// Vazia em vez de apagada: quando o BeforeAll importa a API, o dotenv roda de novo e
// repõe variável AUSENTE — mas não sobrescreve a que já existe, nem vazia.
process.env.RESEND_API_KEY = "";

// as migrations e o bcrypt passam dos 5 segundos padrão do Cucumber
setDefaultTimeout(60_000);

// uma conta de cada papel, criada antes de cada cenário (o "seed" dos testes);
// a segunda atendente existe para os cenários em que duas pessoas disputam o mesmo contato
export const CONTAS = {
  administrador: { nome: "Bruna", email: "admin@oticaviser.com.br", senha: "senha-do-admin-123", papel: "admin" },
  atendente: { nome: "Ana", email: "atendente@oticaviser.com.br", senha: "senha-da-atendente-123", papel: "atendente" },
  "outra atendente": { nome: "Bianca", email: "atendente2@oticaviser.com.br", senha: "senha-da-outra-atendente-123", papel: "atendente" },
} as const;

let servidor: Server;
let baseUrl: string;
let prisma: PrismaClient;

export function url(caminho: string) {
  return `${baseUrl}${caminho}`;
}

BeforeAll(async function () {
  // cria as tabelas no schema de teste com as mesmas migrations da produção
  execSync("npx prisma migrate deploy", { cwd: backend, env: process.env, stdio: "pipe" });

  // só importa a API agora: o Prisma lê o DATABASE_URL na hora em que é criado
  const { criarAplicacaoExpress } = await import("../../src/config_servidor/AplicacaoExpress");
  const { clientePrisma } = await import("../../src/config_servidor/ClientePrisma");
  prisma = clientePrisma;

  // porta 0: o sistema escolhe uma livre, sem brigar com o npm run dev
  const app = criarAplicacaoExpress();
  await new Promise<void>((resolve) => {
    servidor = app.listen(0, () => {
      const { port } = servidor.address() as AddressInfo;
      baseUrl = `http://localhost:${port}/api`;
      resolve();
    });
  });
});

// Cada cenário começa com o banco limpo: cenário não depende da ordem dos outros.
Before(async function () {
  const tabelas = [
    "interacao", "em_atendimento", "lembrete", "marco_acompanhamento", "entrega",
    "cliente_tag", "cliente", "tag", "tipo_marco", "token_recuperacao_senha", "token_revogado", "usuario", "pessoa",
  ].map((tabela) => `"${SCHEMA_TESTE}"."${tabela}"`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tabelas.join(", ")} RESTART IDENTITY CASCADE`);

  // os marcos iniciais do PRD, os mesmos do seed
  await prisma.tipoMarco.createMany({
    data: [
      { nome: "7 dias", diasAposEntrega: 7 },
      { nome: "2 meses", diasAposEntrega: 60 },
      { nome: "1 ano", diasAposEntrega: 365 },
    ],
  });

  for (const conta of Object.values(CONTAS)) {
    await prisma.usuario.create({
      data: {
        email: conta.email,
        // custo 4 no bcrypt: só para o teste ficar rápido, a produção usa 10
        senha: await bcrypt.hash(conta.senha, 4),
        papelAcesso: conta.papel,
        pessoa: { create: { nome: conta.nome } },
      },
    });
  }
});

// UC12 · Recuperar senha (RF20)
// O teste não tem como descobrir um link de verdade: o banco guarda só o hash do token,
// e o token puro existe apenas dentro do e-mail. Então o cenário cria o par aqui — gera
// o token, grava o hash — e devolve o token puro para usar como se tivesse vindo do e-mail.
export async function criarLinkRecuperacao(email: string, minutosParaVencer: number) {
  const usuario = await prisma.usuario.findUniqueOrThrow({ where: { email } });
  const tokenPuro = randomBytes(32).toString("hex");

  await prisma.tokenRecuperacaoSenha.create({
    data: {
      usuarioId: usuario.id,
      tokenHash: createHash("sha256").update(tokenPuro).digest("hex"),
      expiraEm: new Date(Date.now() + minutosParaVencer * 60 * 1000),
    },
  });

  return tokenPuro;
}

// conta gravada antes de o e-mail ser convertido para minúsculas: entra direto no banco,
// porque pela API o e-mail já chegaria convertido
export async function criarContaAntiga(email: string, senha: string) {
  await prisma.usuario.create({
    data: { email, senha: await bcrypt.hash(senha, 4), pessoa: { create: { nome: "Conta antiga" } } },
  });
}

export async function obterIdUsuarioPorEmail(email: string) {
  const usuario = await prisma.usuario.findUniqueOrThrow({ where: { email } });
  return usuario.id;
}

export async function contarLinksRecuperacaoDe(email: string) {
  return prisma.tokenRecuperacaoSenha.count({ where: { usuario: { email } } });
}

export async function contarLinksRecuperacao() {
  return prisma.tokenRecuperacaoSenha.count();
}

// UC03 A1 e UC04 A1 · a rotina dos marcos não pode duplicar lembrete
// A entrega entra direto no banco, sem passar pela API: o cadastro pela API já roda a rotina
// na hora e criaria o marco antes de o cenário começar. Assim o marco ainda não existe quando
// o cenário roda a rotina, que é justamente o caso em que um lembrete duplicado poderia nascer.
export async function registrarEntregaSemRotina(nomeCliente: string, diasAtras: number) {
  await prisma.entrega.create({
    data: {
      dataEntrega: new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000),
      produto: "Armação de acetato",
      cliente: { create: { contato: "(51) 99999-0000", pessoa: { create: { nome: nomeCliente } } } },
    },
  });
}

// UC01 · Entrar no sistema (RF01): encerrar a sessão
// um token encerrado cujo vencimento já passou, como os que se acumulam no banco com o tempo
export async function criarTokenEncerradoVencido() {
  await prisma.tokenRevogado.create({
    data: { jti: randomBytes(16).toString("hex"), expiraEm: new Date(Date.now() - 60 * 1000) },
  });
}

export async function contarTokensEncerrados() {
  return prisma.tokenRevogado.count();
}

// importa a rotina só agora, como a API: o Prisma dela precisa nascer depois do DATABASE_URL de teste
export async function executarLimpezaDeTokens() {
  const { removerTokensVencidos } = await import("../../src/rotina_limpeza/LimpezaTokens");
  return removerTokensVencidos();
}

// várias execuções juntas, como o cron da hora cheia e um cadastro chegando no mesmo instante
export async function rodarRotinaMarcos(vezes: number) {
  const { executarVerificacaoMarcos } = await import("../../src/rotina_marcos/AgendadorMarcos");
  await Promise.all(Array.from({ length: vezes }, () => executarVerificacaoMarcos()));
}

AfterAll(async function () {
  await new Promise((resolve) => servidor.close(resolve));
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${SCHEMA_TESTE}" CASCADE`);
  await prisma.$disconnect();
});
