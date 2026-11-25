import { describe, it, expect } from "vitest";
import {
  calcularDataAlvoMarco,
  calcularMarcosAtingidos,
  verificarMarcoValeParaEntrega,
} from "../utilitarios_datas/CalculoMarcos";

const UM_DIA_EM_MS = 24 * 60 * 60 * 1000;
const dataReferencia = new Date("2026-10-24T12:00:00Z");
// os três marcos iniciais do seed; fora de ordem de propósito, o cálculo devolve do mais curto ao mais longo
const regrasMarco = [
  { id: 3, diasAposEntrega: 365 },
  { id: 1, diasAposEntrega: 7 },
  { id: 2, diasAposEntrega: 60 },
];

function calcularDiasAntes(quantidadeDias: number): Date {
  return new Date(dataReferencia.getTime() - quantidadeDias * UM_DIA_EM_MS);
}

function listarIdsAtingidos(diasDesdeEntrega: number) {
  return calcularMarcosAtingidos(calcularDiasAntes(diasDesdeEntrega), dataReferencia, regrasMarco).map((regra) => regra.id);
}

// UC03 · Calcular marcos de acompanhamento (RF03)
describe("cálculo dos marcos de acompanhamento", () => {
  it("antes de 7 dias nenhum marco foi atingido", () => {
    expect(listarIdsAtingidos(6)).toEqual([]);
  });

  it("no 7º dia exato o marco de 7 dias já conta", () => {
    expect(listarIdsAtingidos(7)).toEqual([1]);
  });

  it("com 70 dias foram atingidos os marcos de 7 dias e 2 meses, mas não o de 1 ano", () => {
    expect(listarIdsAtingidos(70)).toEqual([1, 2]);
  });

  it("com mais de 1 ano todos os marcos foram atingidos", () => {
    expect(listarIdsAtingidos(400)).toEqual([1, 2, 3]);
  });

  it("marco criado pelo administrador (ex: 30 dias) entra no cálculo sem mudar código", () => {
    const regrasComNovoMarco = [...regrasMarco, { id: 4, diasAposEntrega: 30 }];
    const idsAtingidos = calcularMarcosAtingidos(calcularDiasAntes(45), dataReferencia, regrasComNovoMarco).map(
        (regra) => regra.id
    );

    expect(idsAtingidos).toEqual([1, 4]);
  });

  it("a data-alvo é a data real do marco, não a data em que o agendador rodou", () => {
    const dataEntrega = new Date("2026-08-15T00:00:00Z");

    expect(calcularDataAlvoMarco(dataEntrega, 60).toISOString()).toBe("2026-10-14T00:00:00.000Z");
  });
});

// marco novo não pode jogar na lista, de uma vez, todo cliente antigo
describe("marco criado depois da entrega", () => {
  const marcoCriadoEm = new Date("2026-10-24T15:00:00Z");
  const entregaAntigaCadastradaEm = new Date("2026-06-01T10:00:00Z");

  it("não vale para quem já passou do prazo antes de o marco existir", () => {
    const dataAlvoPassada = new Date("2026-07-01T00:00:00Z");

    expect(verificarMarcoValeParaEntrega(dataAlvoPassada, entregaAntigaCadastradaEm, marcoCriadoEm)).toBe(false);
  });

  it("vale para quem atinge o prazo no dia da criação do marco ou depois", () => {
    const dataAlvoHoje = new Date("2026-10-24T00:00:00Z");

    expect(verificarMarcoValeParaEntrega(dataAlvoHoje, entregaAntigaCadastradaEm, marcoCriadoEm)).toBe(true);
  });

  it("entrega cadastrada depois do marco recebe todos os marcos, mesmo com data antiga (UC03 A4)", () => {
    const entregaCadastradaDepois = new Date("2026-10-25T09:00:00Z");
    const dataAlvoPassada = new Date("2026-07-01T00:00:00Z");

    expect(verificarMarcoValeParaEntrega(dataAlvoPassada, entregaCadastradaDepois, marcoCriadoEm)).toBe(true);
  });
});
