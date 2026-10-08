import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const NOMES_TIPO_MARCO = ["7d", "2m", "1a"] as const;

// valores padrão pensados só pra ambiente local — em produção, sobrescreva
// via variáveis de ambiente antes de rodar o seed
const EMAIL_ATENDENTE_PADRAO = process.env.SEED_ATENDENTE_EMAIL ?? "admin@oticaviser.com.br";
const SENHA_ATENDENTE_PADRAO = process.env.SEED_ATENDENTE_SENHA ?? "trocar123";

async function main() {
  for (const nome of NOMES_TIPO_MARCO) {
    await prisma.tipoMarco.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }
  console.log("Seed de tipo_marco concluído.");

  await seedAtendentePadrao();
}

// UC10/RF10 tem uma dependência circular: POST /api/atendentes exige token,
// mas sem nenhum usuário cadastrado ninguém consegue logar pra gerar esse
// token. Essa seed cria a primeira conta pra destravar isso, sem precisar
// abrir a rota de cadastro sem autenticação.
async function seedAtendentePadrao() {
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { email: EMAIL_ATENDENTE_PADRAO },
  });

  if (usuarioExistente) {
    await prisma.usuario.update({
      where: { id: usuarioExistente.id },
      data: { papelAcesso: "admin" },
    });
    console.log("Atendente padrão já existe, papelAcesso garantido como admin.");
    return;
  }

  const senhaComHash = await bcrypt.hash(SENHA_ATENDENTE_PADRAO, 10);

  await prisma.usuario.create({
    data: {
      email: EMAIL_ATENDENTE_PADRAO,
      senha: senhaComHash,
      papelAcesso: "admin",
      pessoa: { create: { nome: "Administrador" } },
    },
  });

  console.log(
      `Atendente padrão criado — email: ${EMAIL_ATENDENTE_PADRAO} / senha: ${SENHA_ATENDENTE_PADRAO} (troque após o primeiro login)`
  );
}

main()
    .catch((erro) => {
      console.error(erro);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });