// Suporte dos testes BDD: sobe a API de verdade, uma vez por execução,
// contra um schema só de teste no PostgreSQL. Nenhum mock: o teste atravessa
// Express, JWT e Prisma até o banco, e o schema de teste vai fora no fim.
import { AfterAll, Before, BeforeAll, setDefaultTimeout } from "@cucumber/cucumber";
import { execSync } from "node:child_process";
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

// as migrations e o bcrypt passam dos 5 segundos padrão do Cucumber
setDefaultTimeout(60_000);

// uma conta de cada papel, criada antes de cada cenário (o "seed" dos testes)
export const CONTAS = {
  administrador: { email: "admin@oticaviser.com.br", senha: "senha-do-admin-123", papel: "admin" },
  atendente: { email: "atendente@oticaviser.com.br", senha: "senha-da-atendente-123", papel: "atendente" },
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
    "cliente_tag", "cliente", "tag", "tipo_marco", "usuario", "pessoa",
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

  for (const [nome, conta] of Object.entries(CONTAS)) {
    await prisma.usuario.create({
      data: {
        email: conta.email,
        // custo 4 no bcrypt: só para o teste ficar rápido, a produção usa 10
        senha: await bcrypt.hash(conta.senha, 4),
        papelAcesso: conta.papel,
        pessoa: { create: { nome } },
      },
    });
  }
});

AfterAll(async function () {
  await new Promise((resolve) => servidor.close(resolve));
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${SCHEMA_TESTE}" CASCADE`);
  await prisma.$disconnect();
});
