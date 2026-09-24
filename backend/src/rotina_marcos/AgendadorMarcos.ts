import cron from "node-cron";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { calcularMarcosAtingidos } from "../utilitarios_datas/CalculoMarcos";

// UC04 · Calcular marcos de acompanhamento (RF03)
// Decisão de implementação (seção 9 do PRD): roda como rotina agendada,
// não como efeito colateral de alguém abrir a tela.
export function iniciarAgendadorMarcos() {
  cron.schedule("0 * * * *", verificarClientesEGerarLembretes);
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

      await clientePrisma.marcoAcompanhamento.create({
        data: {
          entregaId: entrega.id,
          tipoMarcoId,
          dataAlvo: new Date(),
          lembretes: { create: {} },
        },
      });
    }
  }
}