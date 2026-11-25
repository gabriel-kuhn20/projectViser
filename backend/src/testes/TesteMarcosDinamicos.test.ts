import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { criarAplicacaoExpress } from "../config_servidor/AplicacaoExpress";
import { gerarCabecalhoToken } from "./GeradorTokens";

// vi.hoisted: o vi.mock abaixo é movido para o topo do arquivo pelo Vitest,
// então o objeto do mock precisa existir ANTES dos imports
const prismaFalso = vi.hoisted(() => ({
  tipoMarco: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  entrega: { findMany: vi.fn() },
  marcoAcompanhamento: { create: vi.fn() },
}));

vi.mock("../config_servidor/ClientePrisma", () => ({ clientePrisma: prismaFalso }));

const aplicacaoTeste = criarAplicacaoExpress();
const marcoComLembretes = { id: 1, nome: "7 dias", diasAposEntrega: 7, ativo: true, _count: { marcos: 12 } };
const marcoSemLembretes = { id: 4, nome: "15 dias", diasAposEntrega: 15, ativo: true, _count: { marcos: 0 } };

beforeEach(() => {
  vi.clearAllMocks();
  // a rotina de marcos roda depois de cadastrar/editar; sem entregas ela só termina
  prismaFalso.tipoMarco.findMany.mockResolvedValue([]);
  prismaFalso.entrega.findMany.mockResolvedValue([]);
});

// RF23 (UC15): os marcos deixam de ser fixos no código e passam a ser definidos pelo administrador
describe("marcos definidos pelo administrador", () => {
  it("atendente não cadastra marco (403) — RNF06", async () => {
    const resposta = await request(aplicacaoTeste)
      .post("/api/tipos-marco")
      .set("Authorization", gerarCabecalhoToken("atendente", 2))
      .send({ nome: "15 dias", diasAposEntrega: 15 });

    expect(resposta.status).toBe(403);
    expect(prismaFalso.tipoMarco.create).not.toHaveBeenCalled();
  });

  it("admin cadastra marco com nome e dias (201)", async () => {
    prismaFalso.tipoMarco.create.mockResolvedValue({ id: 4, nome: "15 dias", diasAposEntrega: 15, ativo: true });

    const resposta = await request(aplicacaoTeste)
      .post("/api/tipos-marco")
      .set("Authorization", gerarCabecalhoToken("admin", 1))
      .send({ nome: "  15 dias ", diasAposEntrega: 15 });

    expect(resposta.status).toBe(201);
    expect(prismaFalso.tipoMarco.create).toHaveBeenCalledWith({ data: { nome: "15 dias", diasAposEntrega: 15 } });
  });

  it("recusa marco com 0 dias ou dias quebrados (400)", async () => {
    for (const diasInvalidos of [0, 2.5, 4000]) {
      const resposta = await request(aplicacaoTeste)
        .post("/api/tipos-marco")
        .set("Authorization", gerarCabecalhoToken("admin", 1))
        .send({ nome: "Teste", diasAposEntrega: diasInvalidos });

      expect(resposta.status).toBe(400);
    }
    expect(prismaFalso.tipoMarco.create).not.toHaveBeenCalled();
  });

  it("não muda os dias de um marco que já gerou lembretes (409), para o histórico não perder o sentido", async () => {
    prismaFalso.tipoMarco.findUnique.mockResolvedValue(marcoComLembretes);

    const resposta = await request(aplicacaoTeste)
      .put("/api/tipos-marco/1")
      .set("Authorization", gerarCabecalhoToken("admin", 1))
      .send({ diasAposEntrega: 10 });

    expect(resposta.status).toBe(409);
    expect(prismaFalso.tipoMarco.update).not.toHaveBeenCalled();
  });

  it("renomeia e desativa um marco que já gerou lembretes (200)", async () => {
    prismaFalso.tipoMarco.findUnique.mockResolvedValue(marcoComLembretes);
    prismaFalso.tipoMarco.update.mockResolvedValue({ ...marcoComLembretes, nome: "1 semana", ativo: false });

    const resposta = await request(aplicacaoTeste)
      .put("/api/tipos-marco/1")
      .set("Authorization", gerarCabecalhoToken("admin", 1))
      .send({ nome: "1 semana", ativo: false });

    expect(resposta.status).toBe(200);
    expect(prismaFalso.tipoMarco.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { nome: "1 semana", diasAposEntrega: undefined, ativo: false },
    });
  });

  it("não exclui marco que já gerou lembretes (409); exclui o que nunca gerou", async () => {
    prismaFalso.tipoMarco.findUnique.mockResolvedValueOnce(marcoComLembretes).mockResolvedValueOnce(marcoSemLembretes);

    const bloqueada = await request(aplicacaoTeste)
      .delete("/api/tipos-marco/1")
      .set("Authorization", gerarCabecalhoToken("admin", 1));
    const permitida = await request(aplicacaoTeste)
      .delete("/api/tipos-marco/4")
      .set("Authorization", gerarCabecalhoToken("admin", 1));

    expect(bloqueada.status).toBe(409);
    expect(permitida.status).toBe(200);
    expect(prismaFalso.tipoMarco.delete).toHaveBeenCalledTimes(1);
    expect(prismaFalso.tipoMarco.delete).toHaveBeenCalledWith({ where: { id: 4 } });
  });
});
