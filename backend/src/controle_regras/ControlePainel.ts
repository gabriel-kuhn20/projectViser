import { Request, Response } from "express";
import { clientePrisma } from "../config_servidor/ClientePrisma";

const UM_DIA_EM_MS = 24 * 60 * 60 * 1000;
// mesmo limite da etiqueta vermelha da tela de lembretes
export const DIAS_PARA_ATRASO = 7;

// cliente, produto e marco do lembrete, do jeito que o painel mostra
const dadosLembretePainel = {
  marco: {
    select: {
      dataAlvo: true,
      tipoMarco: { select: { id: true, nome: true } },
      entrega: { select: { produto: true, cliente: { select: { id: true, contato: true, pessoa: { select: { nome: true } } } } } },
    },
  },
} as const;

function calcularInicioDoDia(dataReferencia: Date) {
  const inicioDoDia = new Date(dataReferencia);
  inicioDoDia.setHours(0, 0, 0, 0);
  return inicioDoDia;
}

// 1. pendentes e atrasados de cada marco ativo; parte dos marcos cadastrados para o marco
// sem pendência voltar com 0 em vez de sumir do painel
async function contarPendenciasPorMarco(limiteAtraso: Date) {
  const tiposMarcoAtivos = await clientePrisma.tipoMarco.findMany({
    where: { ativo: true },
    orderBy: { diasAposEntrega: "asc" },
  });

  return Promise.all(
      tiposMarcoAtivos.map(async (tipoMarco) => {
        const filtroPendentes = { status: "pendente" as const, marco: { tipoMarcoId: tipoMarco.id } };
        const [pendentes, atrasados] = await Promise.all([
          clientePrisma.lembrete.count({ where: filtroPendentes }),
          clientePrisma.lembrete.count({
            where: { ...filtroPendentes, marco: { ...filtroPendentes.marco, dataAlvo: { lte: limiteAtraso } } },
          }),
        ]);
        return { id: tipoMarco.id, nome: tipoMarco.nome, diasAposEntrega: tipoMarco.diasAposEntrega, pendentes, atrasados };
      })
  );
}

// 2. lembretes que o próprio usuário assumiu e ainda não concluiu — evita esquecer um cliente
async function listarMeusAtendimentos(usuarioId: number) {
  return clientePrisma.emAtendimento.findMany({
    where: { usuarioId, lembrete: { status: "pendente" } },
    orderBy: { iniciadoEm: "asc" },
    select: { iniciadoEm: true, lembrete: { select: { id: true, ...dadosLembretePainel } } },
  });
}

// 3. quem espera há mais tempo em qualquer marco ativo e ninguém assumiu ainda
async function buscarProximoCliente() {
  return clientePrisma.lembrete.findFirst({
    where: { status: "pendente", emAtendimentos: { is: null }, marco: { tipoMarco: { ativo: true } } },
    orderBy: { marco: { dataAlvo: "asc" } },
    select: { id: true, ...dadosLembretePainel },
  });
}

// 5. contatos registrados hoje e nos últimos 7 dias; o administrador vê também por atendente
async function contarContatos(usuarioId: number, ehAdmin: boolean, inicioHoje: Date, inicioSemana: Date) {
  const filtroUsuario = ehAdmin ? {} : { usuarioId };
  const [hoje, semana] = await Promise.all([
    clientePrisma.interacao.count({ where: { ...filtroUsuario, criadoEm: { gte: inicioHoje } } }),
    clientePrisma.interacao.count({ where: { ...filtroUsuario, criadoEm: { gte: inicioSemana } } }),
  ]);
  if (!ehAdmin) return { hoje, semana, porAtendente: [] };

  const [contatosSemana, contatosHoje, atendentes] = await Promise.all([
    clientePrisma.interacao.groupBy({ by: ["usuarioId"], where: { criadoEm: { gte: inicioSemana } }, _count: { _all: true } }),
    clientePrisma.interacao.groupBy({ by: ["usuarioId"], where: { criadoEm: { gte: inicioHoje } }, _count: { _all: true } }),
    clientePrisma.usuario.findMany({ select: { id: true, pessoa: { select: { nome: true } } }, orderBy: { pessoa: { nome: "asc" } } }),
  ]);
  const contarPorUsuario = (grupos: typeof contatosSemana, idUsuario: number) =>
      grupos.find((grupo) => grupo.usuarioId === idUsuario)?._count._all ?? 0;

  const porAtendente = atendentes.map((atendente) => ({
    usuarioId: atendente.id,
    nome: atendente.pessoa.nome,
    hoje: contarPorUsuario(contatosHoje, atendente.id),
    semana: contarPorUsuario(contatosSemana, atendente.id),
  }));
  return { hoje, semana, porAtendente };
}

// UC09 · Ver painel de pendências (RF10, RF19): a tela inicial responde "o que faço agora" —
// pendentes e atrasados por marco, o que ficou comigo, por quem começar e quantos contatos saíram
async function obterPainel(req: Request, res: Response) {
  const { usuarioId, papelAcesso } = req.usuarioLogado!;
  const agora = new Date();
  const limiteAtraso = new Date(agora.getTime() - DIAS_PARA_ATRASO * UM_DIA_EM_MS);
  const inicioHoje = calcularInicioDoDia(agora);
  const inicioSemana = new Date(inicioHoje.getTime() - 6 * UM_DIA_EM_MS);

  const [marcos, meusAtendimentos, proximoCliente, contatos] = await Promise.all([
    contarPendenciasPorMarco(limiteAtraso),
    listarMeusAtendimentos(usuarioId),
    buscarProximoCliente(),
    contarContatos(usuarioId, papelAcesso === "admin", inicioHoje, inicioSemana),
  ]);

  return res.json({ marcos, meusAtendimentos, proximoCliente, contatos });
}

export const controlePainel = { obterPainel };
