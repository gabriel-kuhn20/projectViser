import cron from "node-cron";
import { Prisma } from "@prisma/client";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { calcularDataAlvoMarco, calcularMarcosAtingidos } from "../utilitarios_datas/CalculoMarcos";

// UC04 · Calcular marcos de acompanhamento (RF03)
// Decisão de implementação (seção 9 do PRD): roda como rotina agendada,
// não como efeito colateral de alguém abrir a tela.
export function iniciarAgendadorMarcos() {
  // roda uma vez ao subir o servidor para não esperar a próxima virada de hora
  executarVerificacaoMarcos();
  cron.schedule("0 * * * *", executarVerificacaoMarcos);
}

// também é chamada depois de cadastrar/editar entrega: um cliente com entrega antiga
// precisa aparecer nos lembretes na hora, não só na próxima execução do cron.
// Nunca lança: falha aqui não pode derrubar o cadastro que já foi gravado, nem — fora
// de uma requisição — virar promise rejeitada sem tratamento e derrubar o processo
export function executarVerificacaoMarcos() {
  return verificarClientesEGerarLembretes().catch((erroRotina) => {
    console.error("falha ao gerar lembretes dos marcos:", erroRotina);
  });
}

async function verificarClientesEGerarLembretes() {
  // busca uma vez só e monta um mapa nome -> id (evita 1 query por marco dentro do loop)
  const tiposMarco = await clientePrisma.tipoMarco.findMany();
  const idPorNomeTipoMarco = new Map(tiposMarco.map((tipo) => [tipo.nome, tipo.id]));

  const entregas = await clientePrisma.entrega.findMany({
    include: { marcos: { include: { tipoMarco: true } } },
  });

  for (const entrega of entregas) {
    const marcosAtingidos = calcularMarcosAtingidos(entrega.dataEntrega, new Date());

    for (const nomeTipoMarco of marcosAtingidos) {
      const marcoJaExiste = entrega.marcos.some(
        (marco) => marco.tipoMarco.nome === nomeTipoMarco
      );
      if (marcoJaExiste) continue; // A1: evita duplicar lembrete do mesmo marco

      const tipoMarcoId = idPorNomeTipoMarco.get(nomeTipoMarco);
      if (!tipoMarcoId) continue; // tabela tipo_marco ainda não tem esse valor cadastrado

      try {
        await clientePrisma.marcoAcompanhamento.create({
          data: {
            entregaId: entrega.id,
            tipoMarcoId,
            dataAlvo: calcularDataAlvoMarco(entrega.dataEntrega, nomeTipoMarco),
            lembretes: { create: {} },
          },
        });
      } catch (erroCriacao) {
        // duas execuções ao mesmo tempo (cron + cadastro) podem tentar criar o mesmo
        // marco; o @@unique([entregaId, tipoMarcoId]) barra a segunda — segue o loop
        // em vez de abortar a verificação das outras entregas
        if (erroCriacao instanceof Prisma.PrismaClientKnownRequestError && erroCriacao.code === "P2002") continue;
        throw erroCriacao;
      }
    }
  }
}