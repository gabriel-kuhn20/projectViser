import { Request, Response } from "express";
import { clientePrisma } from "../config_servidor/ClientePrisma";

// UC11 · Ver painel de pendências por marco (RF11)
async function obterResumoPendencias(req: Request, res: Response) {
  const pendenciasPorMarco = await clientePrisma.lembrete.groupBy({
    by: ["marcoId"],
    where: { status: "PENDENTE" },
    _count: true,
  });

  return res.json(pendenciasPorMarco);
}

export const controlePainel = { obterResumoPendencias };
