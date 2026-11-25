import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";
import { executarVerificacaoMarcos } from "../rotina_marcos/AgendadorMarcos";

// vi.hoisted: o vi.mock abaixo é movido para o topo do arquivo pelo Vitest,
// então o objeto do mock precisa existir ANTES dos imports
const prismaFalso = vi.hoisted(() => ({
  tipoMarco: { findMany: vi.fn() },
  entrega: { findMany: vi.fn() },
  marcoAcompanhamento: { create: vi.fn() },
}));

vi.mock("../config_servidor/ClientePrisma", () => ({ clientePrisma: prismaFalso }));

const UM_DIA_EM_MS = 24 * 60 * 60 * 1000;
// marcos do seed, criados antes de qualquer entrega
const marcosCriadosEm = new Date("2026-01-01T00:00:00Z");
const tiposMarco = [
  { id: 1, nome: "7 dias", diasAposEntrega: 7, ativo: true, criadoEm: marcosCriadosEm },
  { id: 2, nome: "2 meses", diasAposEntrega: 60, ativo: true, criadoEm: marcosCriadosEm },
  { id: 3, nome: "1 ano", diasAposEntrega: 365, ativo: true, criadoEm: marcosCriadosEm },
];
// entrega de 70 dias atrás: já atingiu os marcos de 7 dias e 2 meses, ainda não o de 1 ano
const entregaSemMarcos = {
  id: 10,
  dataEntrega: new Date(Date.now() - 70 * UM_DIA_EM_MS),
  criadoEm: new Date(Date.now() - 70 * UM_DIA_EM_MS),
  marcos: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  prismaFalso.tipoMarco.findMany.mockResolvedValue(tiposMarco);
});

// PRD seção 10: a rotina de cálculo de marcos, rodada duas vezes no mesmo período,
// não duplica lembretes para o mesmo cliente e o mesmo marco (UC03 e UC04)
describe("rotina de marcos", () => {
  it("cria um marco com lembrete para cada marco já atingido", async () => {
    prismaFalso.entrega.findMany.mockResolvedValue([entregaSemMarcos]);

    await executarVerificacaoMarcos();

    expect(prismaFalso.marcoAcompanhamento.create).toHaveBeenCalledTimes(2);
    const tiposCriados = prismaFalso.marcoAcompanhamento.create.mock.calls.map((chamada) => chamada[0].data.tipoMarcoId);
    expect(tiposCriados).toEqual([1, 2]);
    expect(prismaFalso.marcoAcompanhamento.create.mock.calls[0][0].data.lembretes).toEqual({ create: {} });
  });

  it("rodada de novo, não recria o que já existe (A1)", async () => {
    // segunda passada: o banco já devolve a entrega com os dois marcos criados na primeira
    const entregaComMarcos = {
      ...entregaSemMarcos,
      marcos: [{ tipoMarcoId: 1 }, { tipoMarcoId: 2 }],
    };
    prismaFalso.entrega.findMany.mockResolvedValueOnce([entregaSemMarcos]).mockResolvedValueOnce([entregaComMarcos]);

    await executarVerificacaoMarcos();
    await executarVerificacaoMarcos();

    expect(prismaFalso.marcoAcompanhamento.create).toHaveBeenCalledTimes(2);
  });

  it("só os marcos ativos geram lembrete (marco desativado pelo administrador fica de fora)", async () => {
    prismaFalso.entrega.findMany.mockResolvedValue([entregaSemMarcos]);

    await executarVerificacaoMarcos();

    expect(prismaFalso.tipoMarco.findMany).toHaveBeenCalledWith({ where: { ativo: true } });
  });

  it("marco criado hoje não gera lembrete retroativo para entrega antiga", async () => {
    const marcoCriadoHoje = { id: 4, nome: "30 dias", diasAposEntrega: 30, ativo: true, criadoEm: new Date() };
    prismaFalso.tipoMarco.findMany.mockResolvedValue([marcoCriadoHoje]);
    prismaFalso.entrega.findMany.mockResolvedValue([entregaSemMarcos]);

    await executarVerificacaoMarcos();

    expect(prismaFalso.marcoAcompanhamento.create).not.toHaveBeenCalled();
  });

  it("duas execuções ao mesmo tempo: o @@unique barra a segunda e a rotina segue sem derrubar o processo", async () => {
    prismaFalso.entrega.findMany.mockResolvedValue([entregaSemMarcos]);
    const erroDuplicado = new Prisma.PrismaClientKnownRequestError("duplicado", { code: "P2002", clientVersion: "5" });
    prismaFalso.marcoAcompanhamento.create.mockRejectedValueOnce(erroDuplicado).mockResolvedValueOnce({});

    await expect(executarVerificacaoMarcos()).resolves.toBeUndefined();
    expect(prismaFalso.marcoAcompanhamento.create).toHaveBeenCalledTimes(2);
  });
});
