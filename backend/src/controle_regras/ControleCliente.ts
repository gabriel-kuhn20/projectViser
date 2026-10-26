import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { executarVerificacaoMarcos } from "../rotina_marcos/AgendadorMarcos";
import { ErroHttp } from "../middlewares_seguranca/ErroHttp";
import {
  validadorCadastroCliente,
  validadorEdicaoCliente,
  validadorListagemClientes,
} from "../validadores_entrada/ValidadorCliente";
import { validadorTagsCliente } from "../validadores_entrada/ValidadorTag";
import { validadorParametroId } from "../validadores_entrada/ValidadorParametros";

// dados que voltam junto com o cliente nas respostas da API
// — senha do responsável propositalmente de fora, nunca deve sair pela API
const dadosIncluidosResposta = {
  pessoa: true,
  responsavel: { select: { id: true, email: true, pessoa: { select: { nome: true } } } },
  tags: { include: { tag: true } },
} as const;

// FK inexistente no create viraria P2003 → 409 "registros vinculados", que engana — por isso busca antes
async function verificarResponsavelExistente(responsavelId: number) {
  const responsavelEncontrado = await clientePrisma.usuario.findUnique({ where: { id: responsavelId } });
  if (!responsavelEncontrado) {
    throw new ErroHttp(404, "atendente responsável não encontrado");
  }
}

// o update mexe na pessoa por relação aninhada, então o responsável também vai por relação:
// o Prisma não aceita misturar `responsavelId` direto com `pessoa: { update }` no mesmo update
function montarAlteracaoResponsavel(responsavelId: number | null | undefined) {
  if (responsavelId === undefined) return undefined;
  if (responsavelId === null) return { disconnect: true };
  return { connect: { id: responsavelId } };
}

// UC02 · Cadastrar cliente (RF02)
async function cadastrarCliente(req: Request, res: Response) {
  const { pessoaId, nome, responsavelId, dataEntrega, produto, ...dadosCliente } =
      validadorCadastroCliente.parse(req.body);

  if (pessoaId) {
    const pessoaExistente = await clientePrisma.pessoa.findUnique({
      where: { id: pessoaId },
      include: { clientes: true },
    });
    if (!pessoaExistente) {
      throw new ErroHttp(404, "pessoa não encontrada");
    }
    // o schema permite vários clientes por pessoa, mas na regra de negócio
    // cada pessoa tem UM cadastro de cliente — evita cliente duplicado na lista
    if (pessoaExistente.clientes.length > 0) {
      throw new ErroHttp(409, "essa pessoa já está cadastrada como cliente");
    }
  }

  if (responsavelId) {
    await verificarResponsavelExistente(responsavelId);
  }

  const novoCliente = await clientePrisma.cliente.create({
    data: {
      ...dadosCliente,
      pessoa: pessoaId ? { connect: { id: pessoaId } } : { create: { nome: nome as string } },
      responsavel: responsavelId ? { connect: { id: responsavelId } } : undefined,
      entregas: { create: { dataEntrega, produto } },
    },
    include: dadosIncluidosResposta,
  });

  await executarVerificacaoMarcos();
  return res.status(201).json(novoCliente);
}

export const CLIENTES_POR_PAGINA = 20;

// % e _ digitados viram texto comum no LIKE, senão "50%" casaria com qualquer coisa
function escaparTermoLike(termoBusca: string) {
  return termoBusca.replace(/[\\%_]/g, (caractere) => `\\${caractere}`);
}

// termo só com número e pontuação de telefone compara só os dígitos do contato, que pode estar
// salvo como "(51) 99999-0000" ou "51999990000"
function montarFiltroBusca(termoBusca: string): Prisma.Sql {
  if (termoBusca === "") return Prisma.sql`TRUE`;

  const digitosBusca = termoBusca.replace(/\D/g, "");
  const ehBuscaNumerica = /^[\d\s()+.-]+$/.test(termoBusca) && digitosBusca.length > 0;
  if (ehBuscaNumerica) {
    // a expressão regular vai como parâmetro: escrita direto no template do JS, a barra do \D se perde
    return Prisma.sql`regexp_replace(c."contato", ${"\\D"}, '', 'g') LIKE ${`%${digitosBusca}%`}`;
  }

  // unaccent: "joao" acha "João" (extensão criada na migração 20261025000000)
  const padraoBusca = `%${escaparTermoLike(termoBusca)}%`;
  return Prisma.sql`(
    unaccent(p."nome") ILIKE unaccent(${padraoBusca})
    OR unaccent(COALESCE(c."endereco", '')) ILIKE unaccent(${padraoBusca})
    OR c."contato" ILIKE ${padraoBusca}
  )`;
}

function montarFiltroTag(tagId: number | undefined): Prisma.Sql {
  if (tagId === undefined) return Prisma.sql`TRUE`;
  return Prisma.sql`EXISTS (SELECT 1 FROM "cliente_tag" ct WHERE ct."clienteId" = c."id" AND ct."tagId" = ${tagId})`;
}

// Listar clientes com busca e paginação no servidor
// a busca vai em SQL porque o Prisma não ignora acento; os dados completos (pessoa, tags,
// responsável) vêm depois pelo findMany só dos ids da página
async function listarClientes(req: Request, res: Response) {
  const { busca, tagId, pagina } = validadorListagemClientes.parse(req.query);
  const filtrosCliente = Prisma.sql`${montarFiltroBusca(busca)} AND ${montarFiltroTag(tagId)}`;
  const deslocamento = (pagina - 1) * CLIENTES_POR_PAGINA;

  const [contagemClientes, idsPagina] = await Promise.all([
    clientePrisma.$queryRaw<{ total: bigint }[]>`
      SELECT COUNT(*) AS total FROM "cliente" c JOIN "pessoa" p ON p."id" = c."pessoaId"
      WHERE ${filtrosCliente}`,
    clientePrisma.$queryRaw<{ id: number }[]>`
      SELECT c."id" FROM "cliente" c JOIN "pessoa" p ON p."id" = c."pessoaId"
      WHERE ${filtrosCliente}
      ORDER BY p."nome" ASC, c."id" ASC
      LIMIT ${CLIENTES_POR_PAGINA} OFFSET ${deslocamento}`,
  ]);

  const idsClientes = idsPagina.map((linha) => linha.id);
  const clientesPagina = await clientePrisma.cliente.findMany({
    where: { id: { in: idsClientes } },
    include: dadosIncluidosResposta,
  });
  // o findMany não garante a ordem do IN; reordena pela ordem alfabética do SQL
  const posicaoPorId = new Map(idsClientes.map((clienteId, posicao) => [clienteId, posicao]));
  clientesPagina.sort((clienteA, clienteB) => posicaoPorId.get(clienteA.id)! - posicaoPorId.get(clienteB.id)!);

  const totalClientes = Number(contagemClientes[0]?.total ?? 0);
  return res.json({
    clientes: clientesPagina,
    total: totalClientes,
    pagina,
    totalPaginas: Math.max(1, Math.ceil(totalClientes / CLIENTES_POR_PAGINA)),
  });
}

// Buscar cliente por id (com as entregas, da mais recente para a mais antiga)
async function buscarClientePorId(req: Request, res: Response) {
  const { id: clienteId } = validadorParametroId.parse({ id: req.params.clienteId });

  const clienteEncontrado = await clientePrisma.cliente.findUnique({
    where: { id: clienteId },
    include: { ...dadosIncluidosResposta, entregas: { orderBy: { dataEntrega: "desc" } } },
  });
  if (!clienteEncontrado) {
    throw new ErroHttp(404, "cliente não encontrado");
  }

  return res.json(clienteEncontrado);
}

// UC03 · Editar cliente (RF09)
async function editarCliente(req: Request, res: Response) {
  const { id: clienteId } = validadorParametroId.parse({ id: req.params.clienteId });
  const { nome, responsavelId, ...dadosCliente } = validadorEdicaoCliente.parse(req.body);

  const clienteExistente = await clientePrisma.cliente.findUnique({ where: { id: clienteId } });
  if (!clienteExistente) {
    throw new ErroHttp(404, "cliente não encontrado");
  }
  if (responsavelId) {
    await verificarResponsavelExistente(responsavelId);
  }

  const clienteAtualizado = await clientePrisma.cliente.update({
    where: { id: clienteId },
    data: {
      ...dadosCliente,
      pessoa: nome ? { update: { nome } } : undefined,
      responsavel: montarAlteracaoResponsavel(responsavelId),
    },
    include: dadosIncluidosResposta,
  });

  return res.json(clienteAtualizado);
}

// Excluir cliente (cascata manual: entregas → marcos → lembretes → interações/em atendimento,
// e vínculos de tag). A pessoa só é apagada junto se não for atendente nem outro cliente
async function excluirCliente(req: Request, res: Response) {
  const { id: clienteId } = validadorParametroId.parse({ id: req.params.clienteId });

  const clienteExistente = await clientePrisma.cliente.findUnique({
    where: { id: clienteId },
    include: { pessoa: { include: { usuario: true, clientes: true } } },
  });
  if (!clienteExistente) {
    throw new ErroHttp(404, "cliente não encontrado");
  }

  await clientePrisma.$transaction(async (transacaoBanco) => {
    const entregasCliente = await transacaoBanco.entrega.findMany({
      where: { clienteId },
      select: { id: true },
    });
    const entregaIds = entregasCliente.map((entrega) => entrega.id);

    const marcosEntregas = await transacaoBanco.marcoAcompanhamento.findMany({
      where: { entregaId: { in: entregaIds } },
      select: { id: true },
    });
    const marcoIds = marcosEntregas.map((marco) => marco.id);

    const lembretesMarcos = await transacaoBanco.lembrete.findMany({
      where: { marcoId: { in: marcoIds } },
      select: { id: true },
    });
    const lembreteIds = lembretesMarcos.map((lembrete) => lembrete.id);

    // ordem das exclusões importa: sempre das tabelas filhas para as pais,
    // senão o banco bloqueia pela chave estrangeira
    await transacaoBanco.emAtendimento.deleteMany({ where: { lembreteId: { in: lembreteIds } } });
    await transacaoBanco.interacao.deleteMany({ where: { lembreteId: { in: lembreteIds } } });
    await transacaoBanco.lembrete.deleteMany({ where: { id: { in: lembreteIds } } });
    await transacaoBanco.marcoAcompanhamento.deleteMany({ where: { id: { in: marcoIds } } });
    await transacaoBanco.entrega.deleteMany({ where: { id: { in: entregaIds } } });
    await transacaoBanco.clienteTag.deleteMany({ where: { clienteId } });
    await transacaoBanco.cliente.delete({ where: { id: clienteId } });

    // se a pessoa também é atendente, ela NÃO é apagada — só o cadastro de cliente sai
    const pessoaCliente = clienteExistente.pessoa;
    const pessoaSemVinculo = !pessoaCliente.usuario && pessoaCliente.clientes.length === 1;
    if (pessoaSemVinculo) {
      await transacaoBanco.pessoa.delete({ where: { id: pessoaCliente.id } });
    }
  });

  return res.json({ mensagem: "cliente excluído, junto com entregas, marcos, lembretes e vínculos de tag" });
}

// UC11 · Manter tag (RF12): vincular tags ao cliente — só o administrador, como a gestão de tags (RF11)
// recebe a lista completa: o que não vier é desvinculado, assim a tela manda só o estado das caixas marcadas
async function definirTagsCliente(req: Request, res: Response) {
  const { id: clienteId } = validadorParametroId.parse({ id: req.params.clienteId });
  const { tagIds } = validadorTagsCliente.parse(req.body);
  const tagIdsUnicos = [...new Set(tagIds)];

  const clienteExistente = await clientePrisma.cliente.findUnique({ where: { id: clienteId } });
  if (!clienteExistente) {
    throw new ErroHttp(404, "cliente não encontrado");
  }
  const totalTagsEncontradas = await clientePrisma.tag.count({ where: { id: { in: tagIdsUnicos } } });
  if (totalTagsEncontradas !== tagIdsUnicos.length) {
    throw new ErroHttp(404, "tag não encontrada");
  }

  const clienteAtualizado = await clientePrisma.$transaction(async (transacaoBanco) => {
    await transacaoBanco.clienteTag.deleteMany({ where: { clienteId } });
    await transacaoBanco.clienteTag.createMany({ data: tagIdsUnicos.map((tagId) => ({ clienteId, tagId })) });
    return transacaoBanco.cliente.findUnique({ where: { id: clienteId }, include: dadosIncluidosResposta });
  });

  return res.json(clienteAtualizado);
}

export const controleCliente = {
  cadastrarCliente,
  listarClientes,
  buscarClientePorId,
  editarCliente,
  excluirCliente,
  definirTagsCliente,
};