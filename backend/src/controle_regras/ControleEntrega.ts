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

// apaga os marcos informados e tudo o que depende deles, sempre das tabelas filhas
// para as pais: em atendimento/interações → lembretes → marcos
async function excluirMarcos(transacaoBanco: Prisma.TransactionClient, marcoIds: number[]) {
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

// apaga os marcos (e o que depende deles) das entregas informadas.
// A entrega em si NÃO é apagada aqui — fica a cargo de quem chama
async function excluirMarcosEntregas(transacaoBanco: Prisma.TransactionClient, entregaIds: number[]) {
    const marcosEntregas = await transacaoBanco.marcoAcompanhamento.findMany({
        where: { entregaId: { in: entregaIds } },
        select: { id: true },
    });
    await excluirMarcos(transacaoBanco, marcosEntregas.map((marco) => marco.id));
}

// o lembrete já teve atendimento: foi concluído, tem contato registrado ou alguém assumiu.
// Apagar o marco dele perderia esse histórico
function verificarAtendimentoIniciado(lembrete: {
    status: string;
    interacoes: unknown[];
    emAtendimentos: unknown | null;
}) {
    return lembrete.status !== "pendente" || lembrete.interacoes.length > 0 || lembrete.emAtendimentos !== null;
}

// UC02 · Manter cliente (RF02): cadastrar entrega para um cliente que já existe (ex: compra de um óculos novo)
async function cadastrarEntrega(req: Request, res: Response) {
    const { clienteId, dataEntrega, produto, tiposMarcoIgnorados } = validadorCadastroEntrega.parse(req.body);

    const clienteExistente = await clientePrisma.cliente.findUnique({ where: { id: clienteId } });
    if (!clienteExistente) {
        throw new ErroHttp(404, "cliente não encontrado");
    }

    const novaEntrega = await clientePrisma.entrega.create({
        data: { clienteId, dataEntrega, produto, tiposMarcoIgnorados },
        include: dadosIncluidosResposta,
    });

    // gera na hora os lembretes dos marcos que a data de entrega já ultrapassou
    await executarVerificacaoMarcos();
    return res.status(201).json(novaEntrega);
}

// UC02 · Manter cliente (RF02, RF18): listar entregas de um cliente, da mais recente para a mais antiga
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

// UC02 · Manter cliente (RF02): buscar entrega por id (com o cliente e o status dos lembretes de cada marco)
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

// UC02 · Manter cliente (RF02): editar produto, data e os marcos que a compra recebe
async function editarEntrega(req: Request, res: Response) {
    const { id: entregaId } = validadorParametroId.parse({ id: req.params.entregaId });
    const { dataEntrega, produto, tiposMarcoIgnorados } = validadorEdicaoEntrega.parse(req.body);

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
    const atendimentoIniciado = entregaExistente.marcos.some((marco) => marco.lembretes.some(verificarAtendimentoIniciado));
    if (dataAlterada && atendimentoIniciado) {
        throw new ErroHttp(409, "não é possível alterar a data: já existe atendimento registrado nos marcos dessa entrega");
    }

    // RF02: marco desmarcado depois do cadastro sai da entrega junto com o lembrete que já gerou,
    // desde que ninguém tenha atendido; com atendimento, o histórico fica e a edição é recusada
    const tiposRecemIgnorados = (tiposMarcoIgnorados ?? []).filter(
        (tipoMarcoId) => !entregaExistente.tiposMarcoIgnorados.includes(tipoMarcoId)
    );
    const marcosRecemIgnorados = entregaExistente.marcos.filter((marco) => tiposRecemIgnorados.includes(marco.tipoMarcoId));
    const marcoIgnoradoComAtendimento = marcosRecemIgnorados.some((marco) => marco.lembretes.some(verificarAtendimentoIniciado));
    if (marcoIgnoradoComAtendimento) {
        throw new ErroHttp(409, "não é possível desmarcar um marco que já tem atendimento registrado nessa entrega");
    }
    const marcosAlterados =
        tiposMarcoIgnorados !== undefined &&
        (tiposMarcoIgnorados.length !== entregaExistente.tiposMarcoIgnorados.length || tiposRecemIgnorados.length > 0);

    const entregaAtualizada = await clientePrisma.$transaction(async (transacaoBanco) => {
        // RF03 (UC03 A3): sem os marcos antigos, o AgendadorMarcos recalcula tudo
        // a partir da nova data logo abaixo
        if (dataAlterada) {
            await excluirMarcosEntregas(transacaoBanco, [entregaId]);
        }
        if (!dataAlterada && marcosRecemIgnorados.length > 0) {
            await excluirMarcos(transacaoBanco, marcosRecemIgnorados.map((marco) => marco.id));
        }

        return transacaoBanco.entrega.update({
            where: { id: entregaId },
            data: { dataEntrega, produto, tiposMarcoIgnorados },
            include: dadosIncluidosResposta,
        });
    });

    // marco que voltou a valer e cuja data já passou ganha o lembrete na hora
    if (dataAlterada || marcosAlterados) {
        await executarVerificacaoMarcos();
    }
    return res.json(entregaAtualizada);
}

// UC02 · Manter cliente (RF02, RF11): excluir entrega (cascata manual: marcos → lembretes → interações/em atendimento)
async function excluirEntrega(req: Request, res: Response) {
    const { id: entregaId } = validadorParametroId.parse({ id: req.params.entregaId });

    const entregaExistente = await clientePrisma.entrega.findUnique({ where: { id: entregaId } });
    if (!entregaExistente) {
        throw new ErroHttp(404, "entrega não encontrada");
    }

    // RNF06: excluir apaga o histórico de contatos da compra; a atendente só corrige cadastro errado
    const totalContatos = await clientePrisma.interacao.count({ where: { lembrete: { marco: { entregaId } } } });
    const ehAdmin = req.usuarioLogado!.papelAcesso === "admin";
    if (totalContatos > 0 && !ehAdmin) {
        throw new ErroHttp(403, "essa compra já tem contato registrado: só o administrador pode excluí-la");
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