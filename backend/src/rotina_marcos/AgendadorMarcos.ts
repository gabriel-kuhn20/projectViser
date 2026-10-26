import cron from "node-cron";
import { Prisma } from "@prisma/client";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import {
  calcularDataAlvoMarco,
  calcularMarcosAtingidos,
  verificarMarcoValeParaEntrega,
} from "../utilitarios_datas/CalculoMarcos";

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
  // só os marcos ativos geram lembretes; buscados uma vez só, fora do loop das entregas
  const tiposMarcoAtivos = await clientePrisma.tipoMarco.findMany({ where: { ativo: true } });

  const entregas = await clientePrisma.entrega.findMany({
    include: { marcos: { select: { tipoMarcoId: true } } },
  });

  for (const entrega of entregas) {
    const marcosAtingidos = calcularMarcosAtingidos(entrega.dataEntrega, new Date(), tiposMarcoAtivos);

    for (const tipoMarco of marcosAtingidos) {
      const marcoJaExiste = entrega.marcos.some((marco) => marco.tipoMarcoId === tipoMarco.id);
      if (marcoJaExiste) continue; // A1: evita duplicar lembrete do mesmo marco

      const dataAlvo = calcularDataAlvoMarco(entrega.dataEntrega, tipoMarco.diasAposEntrega);
      if (!verificarMarcoValeParaEntrega(dataAlvo, entrega.criadoEm, tipoMarco.criadoEm)) continue;

      try {
        await clientePrisma.marcoAcompanhamento.create({
          data: {
            entregaId: entrega.id,
            tipoMarcoId: tipoMarco.id,
            dataAlvo,
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
