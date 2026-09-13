import cron from "node-cron";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { calcularMarcosAtingidos } from "../utilitarios_datas/CalculoMarcos";

// UC04 · Calcular marcos de acompanhamento (RF03)
// Decisão de implementação (seção 9 do PRD): roda como rotina agendada,
// não como efeito colateral de alguém abrir a tela.
export function iniciarAgendadorMarcos() {
  // a cada hora; ajuste a expressão cron conforme a necessidade real da ótica
  cron.schedule("0 * * * *", verificarClientesEGerarLembretes);
}

async function verificarClientesEGerarLembretes() {
  const entregas = await clientePrisma.entrega.findMany({
    include: { marcos: { include: { lembrete: true } } },
  });

  for (const entrega of entregas) {
    const marcosAtingidos = calcularMarcosAtingidos(entrega.dataEntrega, new Date());

    for (const tipoMarco of marcosAtingidos) {
      const marcoJaExiste = entrega.marcos.some((marco) => marco.tipo === tipoMarco);
      if (marcoJaExiste) continue; // A1: evita duplicar lembrete do mesmo marco

      await clientePrisma.marcoAcompanhamento.create({
        data: {
          entregaId: entrega.id,
          tipo: tipoMarco,
          dataAlvo: new Date(),
          lembrete: { create: {} },
        },
      });
    }
  }
}
