import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { criarAplicacaoExpress } from "../config_servidor/AplicacaoExpress";
import { gerarCabecalhoToken } from "./GeradorTokens";

// vi.hoisted: o vi.mock abaixo é movido para o topo do arquivo pelo Vitest,
// então o objeto do mock precisa existir ANTES dos imports
const prismaFalso = vi.hoisted(() => ({
  tag: { findFirst: vi.fn(), create: vi.fn() },
  cliente: { create: vi.fn() },
  interacao: { create: vi.fn() },
}));

vi.mock("../config_servidor/ClientePrisma", () => ({ clientePrisma: prismaFalso }));

const aplicacaoTeste = criarAplicacaoExpress();

beforeEach(() => {
  vi.clearAllMocks();
});

// texto só com espaços passava pelo min(1) e virava registro em branco na tela
describe("validação de texto em branco", () => {
  it("recusa tag só com espaços (400) e não grava", async () => {
    const resposta = await request(aplicacaoTeste)
      .post("/api/tags")
      .set("Authorization", gerarCabecalhoToken("admin", 1))
      .send({ nome: "   " });

    expect(resposta.status).toBe(400);
    expect(prismaFalso.tag.create).not.toHaveBeenCalled();
  });

  it("recusa cliente com nome e contato só com espaços (400)", async () => {
    const resposta = await request(aplicacaoTeste)
      .post("/api/clientes")
      .set("Authorization", gerarCabecalhoToken("atendente", 2))
      .send({ nome: "   ", contato: "   ", dataEntrega: "2026-01-10" });

    expect(resposta.status).toBe(400);
    expect(prismaFalso.cliente.create).not.toHaveBeenCalled();
  });

  it("recusa interação só com espaços (400) — ela liberaria a conclusão do lembrete", async () => {
    const resposta = await request(aplicacaoTeste)
      .post("/api/interacoes")
      .set("Authorization", gerarCabecalhoToken("atendente", 2))
      .send({ lembreteId: 5, conteudo: "   " });

    expect(resposta.status).toBe(400);
    expect(prismaFalso.interacao.create).not.toHaveBeenCalled();
  });
});

// RF02: a entrega guarda o produto comprado em texto livre, obrigatório (PRD seção 8)
describe("produto da entrega", () => {
  it("recusa cliente sem produto (400) e não grava", async () => {
    const resposta = await request(aplicacaoTeste)
      .post("/api/clientes")
      .set("Authorization", gerarCabecalhoToken("atendente", 2))
      .send({ nome: "Cliente Sem Produto", contato: "51999990000", dataEntrega: "2026-01-10" });

    expect(resposta.status).toBe(400);
    expect(resposta.body.detalhes.map((detalhe: { campo: string }) => detalhe.campo)).toContain("produto");
    expect(prismaFalso.cliente.create).not.toHaveBeenCalled();
  });
});

// UC02 · Manter cliente (RF02): data de entrega futura geraria lembretes de óculos não entregue
describe("data de entrega no cadastro de cliente", () => {
  it("recusa data de entrega futura (400), igual à rota de entregas", async () => {
    const resposta = await request(aplicacaoTeste)
      .post("/api/clientes")
      .set("Authorization", gerarCabecalhoToken("atendente", 2))
      .send({ nome: "Cliente Futuro", contato: "51999990000", dataEntrega: "2999-01-01" });

    expect(resposta.status).toBe(400);
    expect(resposta.body.detalhes[0].mensagem).toBe("a data de entrega não pode ser futura");
    expect(prismaFalso.cliente.create).not.toHaveBeenCalled();
  });
});
