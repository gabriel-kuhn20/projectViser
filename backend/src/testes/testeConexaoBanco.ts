import { clientePrisma } from "../config_servidor/ClientePrisma";

// Teste manual de integração (Tarefa 2): usa o MESMO ponto único de conexão
// (clientePrisma) que os controllers usam, provando que escrita e leitura
// funcionam de ponta a ponta contra o banco real.
async function testarLeituraEscrita() {
  console.log("Escrevendo um registro de teste em Pessoa...");
  const pessoaCriada = await clientePrisma.pessoa.create({
    data: { nome: "Pessoa de Teste - Tarefa 2" },
  });
  console.log("Escrita OK, id gerado:", pessoaCriada.id);

  console.log("Lendo o registro de volta...");
  const pessoaLida = await clientePrisma.pessoa.findUnique({
    where: { id: pessoaCriada.id },
  });
  console.log("Leitura OK:", pessoaLida);

  console.log("Removendo o registro de teste (limpeza)...");
  await clientePrisma.pessoa.delete({ where: { id: pessoaCriada.id } });
  console.log("Limpeza OK. Integração com o banco confirmada.");
}

testarLeituraEscrita()
  .catch((erro) => {
    console.error("Falha no teste de integração:", erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await clientePrisma.$disconnect();
  });