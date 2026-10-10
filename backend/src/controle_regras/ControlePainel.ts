import { Request, Response } from "express";
import { clientePrisma } from "../config_servidor/ClientePrisma";

// UC11 · Ver painel de pendências por marco (RF11)
// cada lembrete pendente é um cliente esperando o contato daquele marco; agrupa pelo
// TIPO do marco (7d/2m/1a) — agrupar por marcoId dava uma linha com total 1 para cada marco
async function obterResumoPendencias(req: Request, res: Response) {
  // parte dos tipos cadastrados para o marco sem pendência voltar com 0 em vez de sumir do painel
  const tiposMarco = await clientePrisma.tipoMarco.findMany({ select: { nome: true } });

  const totaisPorTipoMarco = await Promise.all(
      tiposMarco.map(async (tipoMarco) => {
        const totalPendentes = await clientePrisma.lembrete.count({
          where: { status: "pendente", marco: { tipoMarco: { nome: tipoMarco.nome } } },
        });
        return [tipoMarco.nome, totalPendentes] as const;
      })
  );

  const pendenciasPorMarco = Object.fromEntries(totaisPorTipoMarco);
  return res.json(pendenciasPorMarco);
}

export const controlePainel = { obterResumoPendencias };