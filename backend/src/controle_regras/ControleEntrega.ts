import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { executarVerificacaoMarcos } from "../rotina_marcos/AgendadorMarcos";
import { ErroHttp } from "../middlewares_seguranca/ErroHttp";
import { validadorCadastroEntrega, validadorEdicaoEntrega } from "../validadores_entrada/ValidadorEntrega";
import { validadorParametroId } from "../validadores_entrada/ValidadorParametros";

// marcos de acompanhamento que voltam junto com a entrega nas respostas da API
const dadosIncluidosResposta = {
    marcos: { include: { tipoMarco: true }, orderBy: { dataAlvo: "asc" } },
} as const;

// apaga tudo o que depende das entregas informadas, sempre das tabelas filhas
// para as pais: em atendimento/interações → lembretes → marcos.
// A entrega em si NÃO é apagada aqui — fica a cargo de quem chama
async function excluirMarcosEntregas(transacaoBanco: Prisma.TransactionClient, entregaIds: number[]) {
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

    await transacaoBanco.emAtendimento.deleteMany({ where: { lembreteId: { in: lembreteIds } } });
    await transacaoBanco.interacao.deleteMany({ where: { lembreteId: { in: lembreteIds } } });
    await transacaoBanco.lembrete.deleteMany({ where: { id: { in: lembreteIds } } });
    await transacaoBanco.marcoAcompanhamento.deleteMany({ where: { id: { in: marcoIds } } });
}

// Cadastrar entrega para um cliente que já existe (ex: compra de um óculos novo)
async function cadastrarEntrega(req: Request, res: Response) {
    const { clienteId, dataEntrega } = validadorCadastroEntrega.parse(req.body);

    const clienteExistente = await clientePrisma.cliente.findUnique({ where: { id: clienteId } });
    if (!clienteExistente) {
        throw new ErroHttp(404, "cliente não encontrado");
    }

    const novaEntrega = await clientePrisma.entrega.create({
        data: { clienteId, dataEntrega },
        include: dadosIncluidosResposta,
    });

    // gera na hora os lembretes dos marcos que a data de entrega já ultrapassou
    await executarVerificacaoMarcos();
    return res.status(201).json(novaEntrega);
}

// Listar entregas de um cliente, da mais recente para a mais antiga
async function listarEntregasCliente(req: Request, res: Response) {
    const { id: clienteId } = validadorParametroId.parse({ id: req.params.clienteId });

    const clienteExistente = await clientePrisma.cliente.findUnique({ where: { id: clienteId } });
    if (!clienteExistente) {
        throw new ErroHttp(404, "cliente não encontrado");
    }

    const entregasCliente = await clientePrisma.entrega.findMany({
        where: { clienteId },
        include: dadosIncluidosResposta,
        orderBy: { dataEntrega: "desc" },
    });

    return res.json(entregasCliente);
}

// Buscar entrega por id (com o cliente e o status dos lembretes de cada marco)
async function buscarEntregaPorId(req: Request, res: Response) {
    const { id: entregaId } = validadorParametroId.parse({ id: req.params.entregaId });

    const entregaEncontrada = await clientePrisma.entrega.findUnique({
        where: { id: entregaId },
        include: {
            cliente: { include: { pessoa: true } },
            marcos: {
                include: { tipoMarco: true, lembretes: true },
                orderBy: { dataAlvo: "asc" },
            },
        },
    });
    if (!entregaEncontrada) {
        throw new ErroHttp(404, "entrega não encontrada");
    }

    return res.json(entregaEncontrada);
}

// Editar data de entrega
async function editarEntrega(req: Request, res: Response) {
    const { id: entregaId } = validadorParametroId.parse({ id: req.params.entregaId });
    const { dataEntrega } = validadorEdicaoEntrega.parse(req.body);

    const entregaExistente = await clientePrisma.entrega.findUnique({
        where: { id: entregaId },
        include: {
            marcos: { include: { lembretes: { include: { interacoes: true, emAtendimentos: true } } } },
        },
    });
    if (!entregaExistente) {
        throw new ErroHttp(404, "entrega não encontrada");
    }

    const dataAlterada = entregaExistente.dataEntrega.getTime() !== dataEntrega.getTime();

    // trocar a data invalida os marcos já gerados; se algum lembrete já teve
    // atendimento, apagar os marcos perderia esse histórico — então bloqueia
    const atendimentoIniciado = entregaExistente.marcos.some((marco) =>
        marco.lembretes.some(
            (lembrete) =>
                lembrete.status !== "pendente" || lembrete.interacoes.length > 0 || lembrete.emAtendimentos !== null
        )
    );
    if (dataAlterada && atendimentoIniciado) {
        throw new ErroHttp(409, "não é possível alterar a data: já existe atendimento registrado nos marcos dessa entrega");
    }

    const entregaAtualizada = await clientePrisma.$transaction(async (transacaoBanco) => {
        // RF03 (UC04): sem os marcos antigos, o AgendadorMarcos recalcula tudo
        // a partir da nova data logo abaixo
        if (dataAlterada) {
            await excluirMarcosEntregas(transacaoBanco, [entregaId]);
        }

        return transacaoBanco.entrega.update({
            where: { id: entregaId },
            data: { dataEntrega },
            include: dadosIncluidosResposta,
        });
    });

    if (dataAlterada) {
        await executarVerificacaoMarcos();
    }
    return res.json(entregaAtualizada);
}

// Excluir entrega (cascata manual: marcos → lembretes → interações/em atendimento)
async function excluirEntrega(req: Request, res: Response) {
    const { id: entregaId } = validadorParametroId.parse({ id: req.params.entregaId });

    const entregaExistente = await clientePrisma.entrega.findUnique({ where: { id: entregaId } });
    if (!entregaExistente) {
        throw new ErroHttp(404, "entrega não encontrada");
    }

    await clientePrisma.$transaction(async (transacaoBanco) => {
        await excluirMarcosEntregas(transacaoBanco, [entregaId]);
        await transacaoBanco.entrega.delete({ where: { id: entregaId } });
    });

    return res.json({ mensagem: "entrega excluída, junto com marcos, lembretes e interações" });
}

export const controleEntrega = {
    cadastrarEntrega,
    listarEntregasCliente,
    buscarEntregaPorId,
    editarEntrega,
    excluirEntrega,
};