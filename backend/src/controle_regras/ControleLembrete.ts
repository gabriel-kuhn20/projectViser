import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { ErroHttp } from "../middlewares_seguranca/ErroHttp";
import { validadorAntecipacaoLembrete, validadorConclusaoLembrete } from "../validadores_entrada/ValidadorLembrete";
import { calcularDataAlvoMarco } from "../utilitarios_datas/CalculoMarcos";
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

// UC08 · Marcar lembrete como em atendimento (RF08)
// lembrete assumido só recebe contato e conclusão de quem assumiu ou de um admin — senão outra
// atendente registra e conclui por cima e duas pessoas falam com o mesmo cliente (o que o UC08
// existe para evitar). Lembrete que ninguém assumiu continua livre para qualquer atendente
export async function verificarAtendimentoDeOutro(req: Request, lembreteId: number) {
  const { usuarioId, papelAcesso } = req.usuarioLogado!;
  if (papelAcesso === "admin") return;

  const atendimentoAtual = await clientePrisma.emAtendimento.findUnique({ where: { lembreteId } });
  const estaComOutraPessoa = atendimentoAtual !== null && atendimentoAtual.usuarioId !== usuarioId;
  if (estaComOutraPessoa) {
    throw new ErroHttp(409, "lembrete está em atendimento com outra pessoa");
  }
}

// UC05 · Ver lista de lembretes por marco (RF05)
async function listarPorMarco(req: Request, res: Response) {
  // os marcos agora são cadastrados pelo administrador, então a aba é identificada pelo id
  const { id: tipoMarcoId } = validadorParametroId.parse({ id: req.params.tipoMarcoId });

  const lembretesPendentes = await clientePrisma.lembrete.findMany({
    where: { status: "pendente", marco: { tipoMarcoId } },
    include: {
      // as tags vão junto para a atendente saber o perfil do cliente antes de ligar
      marco: {
        include: {
          entrega: {
            include: {
              cliente: {
                include: {
                  pessoa: true,
                  tags: { include: { tag: true } },
                  // as outras compras do cliente dão contexto na ligação; a própria entrega do
                  // lembrete também vem e a tela tira (o Prisma não filtra pelo id do nível de cima)
                  entregas: {
                    select: { id: true, produto: true, dataEntrega: true },
                    orderBy: { dataEntrega: "desc" },
                  },
                },
              },
            },
          },
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
  await verificarAtendimentoDeOutro(req, lembreteId);

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

// UC08 · Marcar lembrete como em atendimento (RF08)
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

// UC08 · A2: desistir do contato libera o lembrete manualmente
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
  // está no contato e os dois acabam ligando para a mesma pessoa (o que o UC08 existe para evitar)
  const { usuarioId, papelAcesso } = req.usuarioLogado!;
  const podeLiberar = papelAcesso === "admin" || atendimentoAtual.usuarioId === usuarioId;
  if (!podeLiberar) {
    throw new ErroHttp(403, "só quem assumiu o atendimento ou um admin pode liberá-lo");
  }

  await clientePrisma.emAtendimento.delete({ where: { lembreteId } });
  return res.status(204).send();
}

// UC07 · Concluir lembrete de contato (RF07) — A4, contato antecipado: o cliente ligou ou passou na loja
// antes do marco vencer. O marco nasce agora com a data real e já com a conversa; quando a data chegar,
// o AgendadorMarcos vê que ele existe e não gera outro (UC03 A1)
async function anteciparLembrete(req: Request, res: Response) {
  const { entregaId, tipoMarcoId, conteudo, respostaCliente, concluir } = validadorAntecipacaoLembrete.parse(req.body);

  const entregaEncontrada = await clientePrisma.entrega.findUnique({ where: { id: entregaId } });
  if (!entregaEncontrada) {
    throw new ErroHttp(404, "entrega não encontrada");
  }
  const tipoMarcoEncontrado = await clientePrisma.tipoMarco.findUnique({ where: { id: tipoMarcoId } });
  if (!tipoMarcoEncontrado || !tipoMarcoEncontrado.ativo) {
    throw new ErroHttp(404, "marco não encontrado ou desativado");
  }
  if (entregaEncontrada.tiposMarcoIgnorados.includes(tipoMarcoId)) {
    throw new ErroHttp(409, "esse marco foi desmarcado para esta compra");
  }

  const usuarioId = req.usuarioLogado!.usuarioId;
  const dataAlvo = calcularDataAlvoMarco(entregaEncontrada.dataEntrega, tipoMarcoEncontrado.diasAposEntrega);

  try {
    // create aninhado: marco, lembrete e interação entram juntos ou nenhum entra
    const marcoAntecipado = await clientePrisma.marcoAcompanhamento.create({
      data: {
        entregaId,
        tipoMarcoId,
        dataAlvo,
        lembretes: {
          create: {
            status: concluir ? "concluido" : "pendente",
            concluidoEm: concluir ? new Date() : null,
            interacoes: { create: { usuarioId, conteudo, respostaCliente } },
          },
        },
      },
      include: { lembretes: true },
    });
    return res.status(201).json(marcoAntecipado);
  } catch (erroCriacao) {
    // o cron (ou outra atendente) gerou esse marco entre a tela abrir e o envio: o @@unique barra
    if (erroCriacao instanceof Prisma.PrismaClientKnownRequestError && erroCriacao.code === "P2002") {
      throw new ErroHttp(409, "esse marco já tem lembrete; registre o contato pela tela de lembretes");
    }
    throw erroCriacao;
  }
}

export const controleLembrete = {
  listarPorMarco,
  anteciparLembrete,
  concluirLembrete,
  reabrirLembrete,
  marcarEmAtendimento,
  desmarcarEmAtendimento,
};
