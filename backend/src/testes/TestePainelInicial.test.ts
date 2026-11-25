import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { criarAplicacaoExpress } from "../config_servidor/AplicacaoExpress";
import { gerarCabecalhoToken } from "./GeradorTokens";

// vi.hoisted: o vi.mock abaixo é movido para o topo do arquivo pelo Vitest,
// então o objeto do mock precisa existir ANTES dos imports
const prismaFalso = vi.hoisted(() => ({
  tipoMarco: { findMany: vi.fn() },
  lembrete: { count: vi.fn(), findFirst: vi.fn() },
  emAtendimento: { findMany: vi.fn() },
  interacao: { count: vi.fn(), groupBy: vi.fn() },
  usuario: { findMany: vi.fn() },
}));

vi.mock("../config_servidor/ClientePrisma", () => ({ clientePrisma: prismaFalso }));

const aplicacaoTeste = criarAplicacaoExpress();

beforeEach(() => {
  vi.clearAllMocks();
  prismaFalso.tipoMarco.findMany.mockResolvedValue([{ id: 1, nome: "7 dias", diasAposEntrega: 7 }]);
  // primeira contagem: pendentes; segunda: atrasados
  prismaFalso.lembrete.count.mockResolvedValueOnce(5).mockResolvedValueOnce(2);
  prismaFalso.emAtendimento.findMany.mockResolvedValue([]);
  prismaFalso.lembrete.findFirst.mockResolvedValue(null);
  prismaFalso.interacao.count.mockResolvedValue(3);
  prismaFalso.interacao.groupBy.mockResolvedValue([{ usuarioId: 2, _count: { _all: 3 } }]);
  prismaFalso.usuario.findMany.mockResolvedValue([
    { id: 1, pessoa: { nome: "Administrador" } },
    { id: 2, pessoa: { nome: "Bruna" } },
  ]);
});

// UC09 · Ver painel de pendências (RF10, RF19)
describe("painel inicial", () => {
  it("mostra pendentes e atrasados de cada marco ativo", async () => {
    const resposta = await request(aplicacaoTeste).get("/api/painel").set("Authorization", gerarCabecalhoToken("atendente", 2));

    expect(resposta.status).toBe(200);
    expect(resposta.body.marcos).toEqual([{ id: 1, nome: "7 dias", diasAposEntrega: 7, pendentes: 5, atrasados: 2 }]);
    expect(prismaFalso.tipoMarco.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { ativo: true } }));
  });

  it("atendente vê só os próprios atendimentos e contatos, sem a lista da equipe", async () => {
    const resposta = await request(aplicacaoTeste).get("/api/painel").set("Authorization", gerarCabecalhoToken("atendente", 2));

    expect(prismaFalso.emAtendimento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { usuarioId: 2, lembrete: { status: "pendente" } } })
    );
    expect(prismaFalso.interacao.count.mock.calls.every(([consulta]) => consulta.where.usuarioId === 2)).toBe(true);
    expect(resposta.body.contatos.porAtendente).toEqual([]);
    expect(prismaFalso.interacao.groupBy).not.toHaveBeenCalled();
  });

  it("admin vê os contatos da equipe por atendente", async () => {
    const resposta = await request(aplicacaoTeste).get("/api/painel").set("Authorization", gerarCabecalhoToken("admin", 1));

    expect(resposta.body.contatos.porAtendente).toEqual([
      { usuarioId: 1, nome: "Administrador", hoje: 0, semana: 0 },
      { usuarioId: 2, nome: "Bruna", hoje: 3, semana: 3 },
    ]);
  });
});
