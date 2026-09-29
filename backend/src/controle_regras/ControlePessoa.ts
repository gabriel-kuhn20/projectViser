import { Request, Response } from "express";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { ErroHttp } from "../middlewares_seguranca/ErroHttp";
import { validadorCadastroPessoa, validadorEdicaoPessoa } from "../validadores_entrada/ValidadorPessoa";
import { validadorParametroId } from "../validadores_entrada/ValidadorParametros";

async function verificarCpfDuplicado(cpf: string, ignorarPessoaId?: number) {
  const pessoaComMesmoCpf = await clientePrisma.pessoa.findFirst({
    where: { cpf, id: ignorarPessoaId ? { not: ignorarPessoaId } : undefined },
  });
  if (pessoaComMesmoCpf) {
    throw new ErroHttp(409, "já existe uma pessoa com esse cpf");
  }
}

// Cadastrar pessoa
async function cadastrarPessoa(req: Request, res: Response) {
  const dados = validadorCadastroPessoa.parse(req.body);

  if (dados.cpf) {
    await verificarCpfDuplicado(dados.cpf);
  }

  const novaPessoa = await clientePrisma.pessoa.create({ data: dados });

  return res.status(201).json(novaPessoa);
}

// Listar pessoas
async function listarPessoas(req: Request, res: Response) {
  const pessoas = await clientePrisma.pessoa.findMany({ orderBy: { nome: "asc" } });
  return res.json(pessoas);
}

// Editar pessoa
async function editarPessoa(req: Request, res: Response) {
  const { id: pessoaId } = validadorParametroId.parse({ id: req.params.pessoaId });
  const dados = validadorEdicaoPessoa.parse(req.body);

  const pessoaExistente = await clientePrisma.pessoa.findUnique({ where: { id: pessoaId } });
  if (!pessoaExistente) {
    throw new ErroHttp(404, "pessoa não encontrada");
  }

  if (dados.cpf) {
    await verificarCpfDuplicado(dados.cpf, pessoaId);
  }

  const pessoaAtualizada = await clientePrisma.pessoa.update({
    where: { id: pessoaId },
    data: dados,
  });

  return res.json(pessoaAtualizada);
}

// Excluir pessoa (cascata manual: usuario/atendente + clientes + tudo que depende deles;
// clientes que a pessoa apenas GERENCIA como atendente ficam sem responsável, não são apagados)
async function excluirPessoa(req: Request, res: Response) {
  const { id: pessoaId } = validadorParametroId.parse({ id: req.params.pessoaId });

  const pessoaExistente = await clientePrisma.pessoa.findUnique({
    where: { id: pessoaId },
    include: { usuario: true, clientes: true },
  });
  if (!pessoaExistente) {
    throw new ErroHttp(404, "pessoa não encontrada");
  }

  await clientePrisma.$transaction(async (tx) => {
    // 1) Se a pessoa é um atendente (Usuario)
    if (pessoaExistente.usuario) {
      const usuarioId = pessoaExistente.usuario.id;

      // clientes que ela apenas gerencia ficam sem responsável
      await tx.cliente.updateMany({
        where: { responsavelId: usuarioId },
        data: { responsavelId: null },
      });

      await tx.emAtendimento.deleteMany({ where: { usuarioId } });
      await tx.interacao.deleteMany({ where: { usuarioId } });
      await tx.usuario.delete({ where: { id: usuarioId } });
    }

    // 2) Se a pessoa é (ou também é) Cliente — cascata completa até o fim da árvore
    const clienteIds = pessoaExistente.clientes.map((c) => c.id);
    if (clienteIds.length > 0) {
      const entregas = await tx.entrega.findMany({
        where: { clienteId: { in: clienteIds } },
        select: { id: true },
      });
      const entregaIds = entregas.map((e) => e.id);

      const marcos = await tx.marcoAcompanhamento.findMany({
        where: { entregaId: { in: entregaIds } },
        select: { id: true },
      });
      const marcoIds = marcos.map((m) => m.id);

      const lembretes = await tx.lembrete.findMany({
        where: { marcoId: { in: marcoIds } },
        select: { id: true },
      });
      const lembreteIds = lembretes.map((l) => l.id);

      await tx.emAtendimento.deleteMany({ where: { lembreteId: { in: lembreteIds } } });
      await tx.interacao.deleteMany({ where: { lembreteId: { in: lembreteIds } } });
      await tx.lembrete.deleteMany({ where: { id: { in: lembreteIds } } });
      await tx.marcoAcompanhamento.deleteMany({ where: { id: { in: marcoIds } } });
      await tx.entrega.deleteMany({ where: { id: { in: entregaIds } } });
      await tx.clienteTag.deleteMany({ where: { clienteId: { in: clienteIds } } });
      await tx.cliente.deleteMany({ where: { id: { in: clienteIds } } });
    }

    // 3) Por fim, a própria pessoa
    await tx.pessoa.delete({ where: { id: pessoaId } });
  });

  return res.json({ mensagem: "pessoa excluída, junto com todos os dados vinculados a ela" });
}

// Buscar pessoa por id
async function buscarPessoaPorId(req: Request, res: Response) {
  const { id: pessoaId } = validadorParametroId.parse({ id: req.params.pessoaId });

  const pessoa = await clientePrisma.pessoa.findUnique({
    where: { id: pessoaId },
    select: {
      id: true,
      nome: true,
      email: true,
      cpf: true,
      criadoEm: true,
      usuario: {
        select: {
          id: true,
          email: true,
          // senha propositalmente de fora — nunca deve sair pela API
        },
      },
      clientes: true,
    },
  });
  if (!pessoa) {
    throw new ErroHttp(404, "pessoa não encontrada");
  }

  return res.json(pessoa);
}

export const controlePessoa = { cadastrarPessoa, listarPessoas, buscarPessoaPorId, editarPessoa, excluirPessoa };