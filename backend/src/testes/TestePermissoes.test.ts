import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import { criarAplicacaoExpress } from "../config_servidor/AplicacaoExpress";
import { gerarCabecalhoToken } from "./GeradorTokens";

// vi.hoisted: o vi.mock abaixo é movido para o topo do arquivo pelo Vitest,
// então o objeto do mock precisa existir ANTES dos imports
const prismaFalso = vi.hoisted(() => ({
  usuario: { findUnique: vi.fn() },
  cliente: { findUnique: vi.fn(), delete: vi.fn() },
  clienteTag: { deleteMany: vi.fn(), createMany: vi.fn() },
  tag: { findFirst: vi.fn(), create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
  entrega: { findUnique: vi.fn(), delete: vi.fn() },
  interacao: { count: vi.fn() },
}));

vi.mock("../config_servidor/ClientePrisma", () => ({ clientePrisma: prismaFalso }));

const aplicacaoTeste = criarAplicacaoExpress();

beforeEach(() => {
  vi.clearAllMocks();
});

// UC01 · Entrar no sistema (RF01) / RNF03: usuário não autenticado não acessa dados de cliente
describe("autenticação", () => {
  it("recusa acesso aos clientes sem token (401)", async () => {
    const resposta = await request(aplicacaoTeste).get("/api/clientes");

    expect(resposta.status).toBe(401);
    expect(resposta.body.mensagem).toBe("token não informado");
  });

  it("recusa login com senha errada (401) sem dizer se o e-mail existe", async () => {
    const senhaComHash = await bcrypt.hash("senhaCorreta123", 4);
    prismaFalso.usuario.findUnique.mockResolvedValue({ id: 1, senha: senhaComHash, papelAcesso: "admin" });

    const resposta = await request(aplicacaoTeste)
      .post("/api/autenticacao/login")
      .send({ email: "admin@oticaviser.com.br", senha: "senhaErrada123" });

    expect(resposta.status).toBe(401);
    expect(resposta.body.mensagem).toBe("email ou senha inválidos");
    expect(resposta.body.token).toBeUndefined();
  });

  it("devolve token com o papel do usuário quando a senha confere (200)", async () => {
    const senhaComHash = await bcrypt.hash("senhaCorreta123", 4);
    prismaFalso.usuario.findUnique.mockResolvedValue({ id: 2, senha: senhaComHash, papelAcesso: "atendente" });

    const resposta = await request(aplicacaoTeste)
      .post("/api/autenticacao/login")
      .send({ email: "atendente@oticaviser.com.br", senha: "senhaCorreta123" });

    expect(resposta.status).toBe(200);
    const payloadToken = JSON.parse(Buffer.from(resposta.body.token.split(".")[1], "base64url").toString());
    expect(payloadToken).toMatchObject({ usuarioId: 2, papelAcesso: "atendente" });
  });
});

// RNF06: ações de administrador são conferidas no servidor, não só escondidas na tela
describe("permissões por papel", () => {
  it("atendente não exclui cliente (403) e nada é apagado", async () => {
    const resposta = await request(aplicacaoTeste)
      .delete("/api/clientes/1")
      .set("Authorization", gerarCabecalhoToken("atendente", 2));

    expect(resposta.status).toBe(403);
    expect(prismaFalso.cliente.delete).not.toHaveBeenCalled();
  });

  it("atendente não cadastra tag (403)", async () => {
    const resposta = await request(aplicacaoTeste)
      .post("/api/tags")
      .set("Authorization", gerarCabecalhoToken("atendente", 2))
      .send({ nome: "Multifocal" });

    expect(resposta.status).toBe(403);
    expect(prismaFalso.tag.create).not.toHaveBeenCalled();
  });

  it("atendente não exclui tag (403)", async () => {
    const resposta = await request(aplicacaoTeste)
      .delete("/api/tags/1")
      .set("Authorization", gerarCabecalhoToken("atendente", 2));

    expect(resposta.status).toBe(403);
    expect(prismaFalso.tag.delete).not.toHaveBeenCalled();
  });

  // RNF06: sem contato a atendente corrige um cadastro errado; com contato, apagaria o histórico
  it("atendente não exclui entrega com contato registrado (403)", async () => {
    prismaFalso.entrega.findUnique.mockResolvedValue({ id: 1 });
    prismaFalso.interacao.count.mockResolvedValue(1);

    const resposta = await request(aplicacaoTeste)
      .delete("/api/entregas/1")
      .set("Authorization", gerarCabecalhoToken("atendente", 2));

    expect(resposta.status).toBe(403);
    expect(prismaFalso.entrega.delete).not.toHaveBeenCalled();
  });

  it("atendente não vincula tags a um cliente (403)", async () => {
    const resposta = await request(aplicacaoTeste)
      .put("/api/clientes/1/tags")
      .set("Authorization", gerarCabecalhoToken("atendente", 2))
      .send({ tagIds: [1] });

    expect(resposta.status).toBe(403);
    expect(prismaFalso.clienteTag.createMany).not.toHaveBeenCalled();
  });

  it("admin cadastra tag (201)", async () => {
    prismaFalso.tag.findFirst.mockResolvedValue(null);
    prismaFalso.tag.create.mockResolvedValue({ id: 10, nome: "Multifocal" });

    const resposta = await request(aplicacaoTeste)
      .post("/api/tags")
      .set("Authorization", gerarCabecalhoToken("admin", 1))
      .send({ nome: "Multifocal" });

    expect(resposta.status).toBe(201);
    expect(resposta.body).toEqual({ id: 10, nome: "Multifocal" });
  });
});
