import { Request, Response } from "express";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { ErroHttp } from "../middlewares_seguranca/ErroHttp";
import { validadorConclusaoLembrete } from "../validadores_entrada/ValidadorLembrete";
import { validadorParametroId } from "../validadores_entrada/ValidadorParametros";

// Buscar lembrete que ainda aceita atendimento
// assumir, registrar interação e concluir só valem para lembrete pendente; a checagem
// de existência vem ANTES de gravar — senão um id inexistente cai no P2003 (chave
// estrangeira) e o middleware responde 409 "existem registros vinculados" em vez de 404
export async function buscarLembretePendente(lembreteId: number) {
  const lembreteEncontrado = await clientePrisma.lembrete.findUnique({ where: { id: lembreteId } });
  if (!lembreteEncontrado) {
    throw new ErroHttp(404, "lembrete não encontrado");
  }
  if (lembreteEncontrado.status !== "pendente") {
    throw new ErroHttp(409, "lembrete já foi concluído");
  }
  return lembreteEncontrado;
}

// UC05 · Ver lista de lembretes por marco (RF04)
async function listarPorMarco(req: Request, res: Response) {
  // os marcos agora são cadastrados pelo administrador, então a aba é identificada pelo id
  const { id: tipoMarcoId } = validadorParametroId.parse({ id: req.params.tipoMarcoId });

  const lembretesPendentes = await clientePrisma.lembrete.findMany({
    where: { status: "pendente", marco: { tipoMarcoId } },
    include: {
      // as tags vão junto para a atendente saber o perfil do cliente antes de ligar
      marco: {
        include: {
          entrega: { include: { cliente: { include: { pessoa: true, tags: { include: { tag: true } } } } } },
        },
      },
      // quem está atendendo aparece na tela para outro atendente não ligar para o mesmo
      // cliente — só o nome sai, email e senha do usuário ficam de fora
      emAtendimentos: { include: { usuario: { select: { id: true, pessoa: { select: { nome: true } } } } } },
      // tentativas já registradas (não atendeu, pediu para ligar depois...): o lembrete só sai da
      // lista quando alguém conclui, e quem pega o cliente vê o que já foi tentado
      interacoes: {
        orderBy: { criadoEm: "asc" },
        select: {
          id: true,
          conteudo: true,
          respostaCliente: true,
          criadoEm: true,
          editadoEm: true,
          usuarioId: true,
          usuario: { select: { pessoa: { select: { nome: true } } } },
        },
      },
    },
    // o marco atingido há mais tempo vem primeiro: é o cliente que espera contato há mais tempo
    orderBy: { marco: { dataAlvo: "asc" } },
  });

  return res.json(lembretesPendentes);
}

// UC07 · Concluir lembrete de contato (RF07)
// com `conteudo` no corpo, registra a interação e conclui na mesma transação (o "concluir" da tela
// abre o formulário da interação — RF17); sem ele, A1: só conclui se já houver interação registrada
async function concluirLembrete(req: Request, res: Response) {
  const lembreteId = Number(req.params.lembreteId);
  if (Number.isNaN(lembreteId)) {
    return res.status(400).json({ mensagem: "lembreteId inválido" });
  }
  const { conteudo, respostaCliente } = validadorConclusaoLembrete.parse(req.body ?? {});

  await buscarLembretePendente(lembreteId);

  const totalInteracoes = await clientePrisma.interacao.count({ where: { lembreteId } });
  const semInteracaoRegistrada = totalInteracoes === 0 && !conteudo;
  if (semInteracaoRegistrada) {
    return res.status(400).json({ mensagem: "registre uma interação antes de concluir o lembrete" });
  }

  const usuarioId = req.usuarioLogado!.usuarioId;
  const lembreteConcluido = await clientePrisma.$transaction(async (transacao) => {
    if (conteudo) {
      await transacao.interacao.create({ data: { lembreteId, usuarioId, conteudo, respostaCliente } });
    }
    await transacao.emAtendimento.deleteMany({ where: { lembreteId } });
    return transacao.lembrete.update({
      where: { id: lembreteId },
      data: { status: "concluido", concluidoEm: new Date() },
    });
  });

  return res.json(lembreteConcluido);
}

// UC07 · Concluir lembrete de contato (RF07) — A3: reabrir lembrete concluído por engano
// só o admin (rota com exigirPapel); as tentativas continuam vinculadas e o lembrete volta
// para a aba do marco. Cliente que retorna com problema é contato novo, não reabertura
async function reabrirLembrete(req: Request, res: Response) {
  const { id: lembreteId } = validadorParametroId.parse({ id: req.params.lembreteId });

  const lembreteEncontrado = await clientePrisma.lembrete.findUnique({ where: { id: lembreteId } });
  if (!lembreteEncontrado) {
    throw new ErroHttp(404, "lembrete não encontrado");
  }
  if (lembreteEncontrado.status === "pendente") {
    throw new ErroHttp(409, "lembrete já está pendente");
  }

  const lembreteReaberto = await clientePrisma.lembrete.update({
    where: { id: lembreteId },
    data: { status: "pendente", concluidoEm: null },
  });

  return res.json(lembreteReaberto);
}

// UC09 · Marcar lembrete como em atendimento (RF08)
// A1: outro atendente já tratando aquele lembrete não pode assumir de novo
async function marcarEmAtendimento(req: Request, res: Response) {
  const lembreteId = Number(req.params.lembreteId);
  if (Number.isNaN(lembreteId)) {
    return res.status(400).json({ mensagem: "lembreteId inválido" });
  }
  const usuarioId = req.usuarioLogado!.usuarioId;
  await buscarLembretePendente(lembreteId);

  const jaEmAtendimento = await clientePrisma.emAtendimento.findUnique({ where: { lembreteId } });
  if (jaEmAtendimento) {
    return res.status(409).json({ mensagem: "lembrete já está sendo tratado por outro atendente" });
  }

  const registro = await clientePrisma.emAtendimento.create({ data: { lembreteId, usuarioId } });
  return res.status(201).json(registro);
}

// UC09 · A2: desistir do contato libera o lembrete manualmente
async function desmarcarEmAtendimento(req: Request, res: Response) {
  const lembreteId = Number(req.params.lembreteId);
  if (Number.isNaN(lembreteId)) {
    return res.status(400).json({ mensagem: "lembreteId inválido" });
  }

  const atendimentoAtual = await clientePrisma.emAtendimento.findUnique({ where: { lembreteId } });
  if (!atendimentoAtual) {
    throw new ErroHttp(404, "lembrete não está em atendimento");
  }

  // só quem assumiu ou um admin libera — senão outro atendente tira o cliente da mão de quem
  // está no contato e os dois acabam ligando para a mesma pessoa (o que o UC09 existe para evitar)
  const { usuarioId, papelAcesso } = req.usuarioLogado!;
  const podeLiberar = papelAcesso === "admin" || atendimentoAtual.usuarioId === usuarioId;
  if (!podeLiberar) {
    throw new ErroHttp(403, "só quem assumiu o atendimento ou um admin pode liberá-lo");
  }

  await clientePrisma.emAtendimento.delete({ where: { lembreteId } });
  return res.status(204).send();
}

export const controleLembrete = {
  listarPorMarco,
  concluirLembrete,
  reabrirLembrete,
  marcarEmAtendimento,
  desmarcarEmAtendimento,
};