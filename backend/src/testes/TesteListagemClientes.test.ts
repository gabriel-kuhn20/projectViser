import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { criarAplicacaoExpress } from "../config_servidor/AplicacaoExpress";
import { CLIENTES_POR_PAGINA } from "../controle_regras/ControleCliente";
import { gerarCabecalhoToken } from "./GeradorTokens";

// vi.hoisted: o vi.mock abaixo é movido para o topo do arquivo pelo Vitest,
// então o objeto do mock precisa existir ANTES dos imports
const prismaFalso = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
  cliente: { findMany: vi.fn() },
}));

vi.mock("../config_servidor/ClientePrisma", () => ({ clientePrisma: prismaFalso }));

const aplicacaoTeste = criarAplicacaoExpress();

// valores enviados ao banco na consulta crua (os parâmetros do Prisma.sql)
function listarParametrosConsulta(indiceChamada: number) {
  return prismaFalso.$queryRaw.mock.calls[indiceChamada].slice(1).flatMap((parametro: { values?: unknown[] }) =>
      parametro?.values ?? [parametro]
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

// RNF01: com 5.000 clientes a tela não pode baixar a base inteira para mostrar a lista
describe("listagem de clientes paginada no servidor", () => {
  it("devolve só a página pedida, com o total, e mantém a ordem alfabética do banco", async () => {
    prismaFalso.$queryRaw.mockResolvedValueOnce([{ total: 45n }]).mockResolvedValueOnce([{ id: 7 }, { id: 3 }]);
    prismaFalso.cliente.findMany.mockResolvedValue([{ id: 3, pessoa: { nome: "Bruna" } }, { id: 7, pessoa: { nome: "Ana" } }]);

    const resposta = await request(aplicacaoTeste)
      .get("/api/clientes?pagina=3")
      .set("Authorization", gerarCabecalhoToken("atendente", 2));

    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({ total: 45, pagina: 3, totalPaginas: 3 });
    expect(resposta.body.clientes.map((cliente: { id: number }) => cliente.id)).toEqual([7, 3]);
    // página 3 começa depois dos 2 × 20 primeiros
    expect(listarParametrosConsulta(1)).toEqual(expect.arrayContaining([CLIENTES_POR_PAGINA, 2 * CLIENTES_POR_PAGINA]));
    expect(prismaFalso.cliente.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: { in: [7, 3] } } }));
  });

  it("busca por telefone compara só os dígitos, e % digitado não vira curinga", async () => {
    prismaFalso.$queryRaw.mockResolvedValue([]);
    prismaFalso.cliente.findMany.mockResolvedValue([]);

    await request(aplicacaoTeste)
      .get(`/api/clientes?busca=${encodeURIComponent("(51) 9888")}`)
      .set("Authorization", gerarCabecalhoToken("atendente", 2));
    await request(aplicacaoTeste)
      .get(`/api/clientes?busca=${encodeURIComponent("50%")}`)
      .set("Authorization", gerarCabecalhoToken("atendente", 2));

    expect(listarParametrosConsulta(0)).toContain("%519888%");
    expect(listarParametrosConsulta(2)).toContain("%50\\%%");
  });

  it("recusa página inválida (400)", async () => {
    const resposta = await request(aplicacaoTeste)
      .get("/api/clientes?pagina=0")
      .set("Authorization", gerarCabecalhoToken("atendente", 2));

    expect(resposta.status).toBe(400);
    expect(prismaFalso.$queryRaw).not.toHaveBeenCalled();
  });
});
