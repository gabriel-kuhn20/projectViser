import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { criarAplicacaoExpress } from "../config_servidor/AplicacaoExpress";
import { gerarCabecalhoToken } from "./GeradorTokens";

// vi.hoisted: o vi.mock abaixo é movido para o topo do arquivo pelo Vitest,
// então o objeto do mock precisa existir ANTES dos imports
const prismaFalso = vi.hoisted(() => {
  const prisma = {
    lembrete: { findUnique: vi.fn(), update: vi.fn() },
    interacao: { count: vi.fn(), create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    usuario: { findUnique: vi.fn() },
    emAtendimento: { findUnique: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
    // a transação roda a função recebida com o próprio mock, como o Prisma faz com o cliente da transação
    $transaction: vi.fn(),
  };
  prisma.$transaction.mockImplementation((executarTransacao: (transacao: unknown) => unknown) =>
    executarTransacao(prisma)
  );
  return prisma;
});

vi.mock("../config_servidor/ClientePrisma", () => ({ clientePrisma: prismaFalso }));

const aplicacaoTeste = criarAplicacaoExpress();
const lembretePendente = { id: 5, status: "pendente" };

beforeEach(() => {
  vi.clearAllMocks();
});

// UC07 · Concluir lembrete de contato (RF07)
describe("concluir lembrete", () => {
  it("A1: bloqueia a conclusão sem interação registrada (400)", async () => {
    prismaFalso.lembrete.findUnique.mockResolvedValue(lembretePendente);
    prismaFalso.interacao.count.mockResolvedValue(0);

    const resposta = await request(aplicacaoTeste)
      .patch("/api/lembretes/5/concluir")
      .set("Authorization", gerarCabecalhoToken("atendente", 2));

    expect(resposta.status).toBe(400);
    expect(resposta.body.mensagem).toBe("registre uma interação antes de concluir o lembrete");
    expect(prismaFalso.lembrete.update).not.toHaveBeenCalled();
  });

  it("conclui quando já existe interação e libera o \"em atendimento\" (200)", async () => {
    prismaFalso.lembrete.findUnique.mockResolvedValue(lembretePendente);
    prismaFalso.interacao.count.mockResolvedValue(1);
    prismaFalso.lembrete.update.mockResolvedValue({ ...lembretePendente, status: "concluido" });

    const resposta = await request(aplicacaoTeste)
      .patch("/api/lembretes/5/concluir")
      .set("Authorization", gerarCabecalhoToken("atendente", 2));

    expect(resposta.status).toBe(200);
    expect(resposta.body.status).toBe("concluido");
    expect(prismaFalso.emAtendimento.deleteMany).toHaveBeenCalledWith({ where: { lembreteId: 5 } });
  });

  it("UC07: conclui registrando a interação na mesma ação, mesmo sem contato anterior (200)", async () => {
    prismaFalso.lembrete.findUnique.mockResolvedValue(lembretePendente);
    prismaFalso.interacao.count.mockResolvedValue(0);
    prismaFalso.lembrete.update.mockResolvedValue({ ...lembretePendente, status: "concluido" });

    const resposta = await request(aplicacaoTeste)
      .patch("/api/lembretes/5/concluir")
      .set("Authorization", gerarCabecalhoToken("atendente", 2))
      .send({ conteudo: "Cliente adaptou bem à lente", respostaCliente: "Satisfeito" });

    expect(resposta.status).toBe(200);
    expect(prismaFalso.interacao.create).toHaveBeenCalledWith({
      data: { lembreteId: 5, usuarioId: 2, conteudo: "Cliente adaptou bem à lente", respostaCliente: "Satisfeito" },
    });
  });

  it("não conclui com interação só de espaços (400) e não grava nada", async () => {
    const resposta = await request(aplicacaoTeste)
      .patch("/api/lembretes/5/concluir")
      .set("Authorization", gerarCabecalhoToken("atendente", 2))
      .send({ conteudo: "   " });

    expect(resposta.status).toBe(400);
    expect(prismaFalso.interacao.create).not.toHaveBeenCalled();
    expect(prismaFalso.lembrete.update).not.toHaveBeenCalled();
  });

  it("não conclui lembrete que já foi concluído (409)", async () => {
    prismaFalso.lembrete.findUnique.mockResolvedValue({ id: 5, status: "concluido" });

    const resposta = await request(aplicacaoTeste)
      .patch("/api/lembretes/5/concluir")
      .set("Authorization", gerarCabecalhoToken("atendente", 2));

    expect(resposta.status).toBe(409);
  });
});

// UC08 · A2: desistir do contato libera o lembrete manualmente
// UC07 A2: o cliente nem sempre atende — cada tentativa é registrada e a atendente conclui quando quiser
describe("várias tentativas de contato no mesmo lembrete", () => {
  it("registra uma nova tentativa sem concluir o lembrete (201)", async () => {
    prismaFalso.usuario.findUnique.mockResolvedValue({ id: 2 });
    prismaFalso.lembrete.findUnique.mockResolvedValue(lembretePendente);
    prismaFalso.interacao.create.mockResolvedValue({ id: 11, lembreteId: 5, conteudo: "não atendeu" });

    const resposta = await request(aplicacaoTeste)
      .post("/api/interacoes")
      .set("Authorization", gerarCabecalhoToken("atendente", 2))
      .send({ lembreteId: 5, conteudo: "não atendeu" });

    expect(resposta.status).toBe(201);
    expect(prismaFalso.lembrete.update).not.toHaveBeenCalled();
  });

  it("conclui sem texto novo quando já há tentativas, sem gravar interação vazia (200)", async () => {
    prismaFalso.lembrete.findUnique.mockResolvedValue(lembretePendente);
    prismaFalso.interacao.count.mockResolvedValue(2);
    prismaFalso.lembrete.update.mockResolvedValue({ ...lembretePendente, status: "concluido" });

    const resposta = await request(aplicacaoTeste)
      .patch("/api/lembretes/5/concluir")
      .set("Authorization", gerarCabecalhoToken("atendente", 2))
      .send({});

    expect(resposta.status).toBe(200);
    expect(prismaFalso.interacao.create).not.toHaveBeenCalled();
  });
});

// UC07 A3: só o admin desfaz uma conclusão feita por engano
describe("reabrir lembrete", () => {
  it("atendente não reabre lembrete (403) e nada é alterado", async () => {
    const resposta = await request(aplicacaoTeste)
      .patch("/api/lembretes/5/reabrir")
      .set("Authorization", gerarCabecalhoToken("atendente", 2));

    expect(resposta.status).toBe(403);
    expect(prismaFalso.lembrete.update).not.toHaveBeenCalled();
  });

  it("admin reabre lembrete concluído, que volta a pendente (200)", async () => {
    prismaFalso.lembrete.findUnique.mockResolvedValue({ id: 5, status: "concluido" });
    prismaFalso.lembrete.update.mockResolvedValue({ id: 5, status: "pendente", concluidoEm: null });

    const resposta = await request(aplicacaoTeste)
      .patch("/api/lembretes/5/reabrir")
      .set("Authorization", gerarCabecalhoToken("admin", 1));

    expect(resposta.status).toBe(200);
    expect(prismaFalso.lembrete.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { status: "pendente", concluidoEm: null },
    });
  });

  it("não reabre lembrete que já está pendente (409)", async () => {
    prismaFalso.lembrete.findUnique.mockResolvedValue(lembretePendente);

    const resposta = await request(aplicacaoTeste)
      .patch("/api/lembretes/5/reabrir")
      .set("Authorization", gerarCabecalhoToken("admin", 1));

    expect(resposta.status).toBe(409);
  });
});

// UC07 A2 (RF07): correção do texto de uma tentativa, marcada como editada
describe("editar interação", () => {
  const interacaoDoAtendente2 = { id: 11, usuarioId: 2, lembrete: { status: "pendente" } };

  it("autor corrige o texto e a interação fica marcada como editada (200)", async () => {
    prismaFalso.interacao.findUnique.mockResolvedValue(interacaoDoAtendente2);
    prismaFalso.interacao.update.mockResolvedValue({ id: 11, conteudo: "não atendeu" });

    const resposta = await request(aplicacaoTeste)
      .patch("/api/interacoes/11")
      .set("Authorization", gerarCabecalhoToken("atendente", 2))
      .send({ conteudo: "não atendeu", respostaCliente: "" });

    expect(resposta.status).toBe(200);
    const dadosGravados = prismaFalso.interacao.update.mock.calls[0][0].data;
    expect(dadosGravados.conteudo).toBe("não atendeu");
    expect(dadosGravados.respostaCliente).toBeNull();
    expect(dadosGravados.editadoEm).toBeInstanceOf(Date);
  });

  it("outro atendente não edita a interação (403)", async () => {
    prismaFalso.interacao.findUnique.mockResolvedValue(interacaoDoAtendente2);

    const resposta = await request(aplicacaoTeste)
      .patch("/api/interacoes/11")
      .set("Authorization", gerarCabecalhoToken("atendente", 3))
      .send({ conteudo: "texto alterado" });

    expect(resposta.status).toBe(403);
    expect(prismaFalso.interacao.update).not.toHaveBeenCalled();
  });

  it("não edita interação de lembrete concluído (409)", async () => {
    prismaFalso.interacao.findUnique.mockResolvedValue({ ...interacaoDoAtendente2, lembrete: { status: "concluido" } });

    const resposta = await request(aplicacaoTeste)
      .patch("/api/interacoes/11")
      .set("Authorization", gerarCabecalhoToken("admin", 1))
      .send({ conteudo: "texto alterado" });

    expect(resposta.status).toBe(409);
    expect(prismaFalso.interacao.update).not.toHaveBeenCalled();
  });
});

describe("liberar atendimento", () => {
  it("atendente não libera o atendimento assumido por outro (403)", async () => {
    prismaFalso.emAtendimento.findUnique.mockResolvedValue({ lembreteId: 5, usuarioId: 3 });

    const resposta = await request(aplicacaoTeste)
      .delete("/api/lembretes/5/em-atendimento")
      .set("Authorization", gerarCabecalhoToken("atendente", 2));

    expect(resposta.status).toBe(403);
    expect(prismaFalso.emAtendimento.delete).not.toHaveBeenCalled();
  });

  it("quem assumiu libera o próprio atendimento (204)", async () => {
    prismaFalso.emAtendimento.findUnique.mockResolvedValue({ lembreteId: 5, usuarioId: 2 });

    const resposta = await request(aplicacaoTeste)
      .delete("/api/lembretes/5/em-atendimento")
      .set("Authorization", gerarCabecalhoToken("atendente", 2));

    expect(resposta.status).toBe(204);
    expect(prismaFalso.emAtendimento.delete).toHaveBeenCalledWith({ where: { lembreteId: 5 } });
  });
});
