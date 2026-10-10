import { Request, Response } from "express";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { executarVerificacaoMarcos } from "../rotina_marcos/AgendadorMarcos";
import { ErroHttp } from "../middlewares_seguranca/ErroHttp";
import { validadorCadastroCliente, validadorEdicaoCliente } from "../validadores_entrada/ValidadorCliente";
import { validadorParametroId } from "../validadores_entrada/ValidadorParametros";

// dados que voltam junto com o cliente nas respostas da API
// — senha do responsável propositalmente de fora, nunca deve sair pela API
const dadosIncluidosResposta = {
  pessoa: true,
  responsavel: { select: { id: true, email: true, pessoa: { select: { nome: true } } } },
  tags: { include: { tag: true } },
} as const;

// UC02 · Cadastrar cliente (RF02)
async function cadastrarCliente(req: Request, res: Response) {
  const { pessoaId, nome, responsavelId, dataEntrega, ...dadosCliente } =
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
    const responsavelEncontrado = await clientePrisma.usuario.findUnique({ where: { id: responsavelId } });
    if (!responsavelEncontrado) {
      throw new ErroHttp(404, "atendente responsável não encontrado");
    }
  }

  const novoCliente = await clientePrisma.cliente.create({
    data: {
      ...dadosCliente,
      pessoa: pessoaId ? { connect: { id: pessoaId } } : { create: { nome: nome as string } },
      responsavel: responsavelId ? { connect: { id: responsavelId } } : undefined,
      entregas: { create: { dataEntrega } },
    },
    include: dadosIncluidosResposta,
  });

  await executarVerificacaoMarcos();
  return res.status(201).json(novoCliente);
}

// Listar clientes
async function listarClientes(req: Request, res: Response) {
  const clientesCadastrados = await clientePrisma.cliente.findMany({
    include: dadosIncluidosResposta,
    orderBy: { pessoa: { nome: "asc" } },
  });
  return res.json(clientesCadastrados);
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
  const { nome, ...dadosCliente } = validadorEdicaoCliente.parse(req.body);

  const clienteExistente = await clientePrisma.cliente.findUnique({ where: { id: clienteId } });
  if (!clienteExistente) {
    throw new ErroHttp(404, "cliente não encontrado");
  }

  const clienteAtualizado = await clientePrisma.cliente.update({
    where: { id: clienteId },
    data: {
      ...dadosCliente,
      pessoa: nome ? { update: { nome } } : undefined,
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

export const controleCliente = {
  cadastrarCliente,
  listarClientes,
  buscarClientePorId,
  editarCliente,
  excluirCliente,
};