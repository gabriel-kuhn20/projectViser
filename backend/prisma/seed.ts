import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NOMES_TIPO_MARCO = ["7d", "2m", "1a"] as const;

async function main() {
  for (const nome of NOMES_TIPO_MARCO) {
    await prisma.tipoMarco.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }
  console.log("Seed de tipo_marco concluído.");
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });