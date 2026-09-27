import { Request, Response } from "express";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { ErroHttp } from "../middlewares_seguranca/ErroHttp";
import { validadorCadastroTag, validadorEdicaoTag } from "../validadores_entrada/ValidadorTag";
import { validadorParametroId } from "../validadores_entrada/ValidadorParametros";

// Cadastrar tag
async function cadastrarTag(req: Request, res: Response) {
  const { nome } = validadorCadastroTag.parse(req.body);

  const tagExistente = await clientePrisma.tag.findFirst({ where: { nome } });
  if (tagExistente) {
    throw new ErroHttp(409, "já existe uma tag com esse nome");
  }

  const novaTag = await clientePrisma.tag.create({ data: { nome } });

  return res.status(201).json(novaTag);
}

// Listar tags
async function listarTags(req: Request, res: Response) {
  const tags = await clientePrisma.tag.findMany({ orderBy: { nome: "asc" } });
  return res.json(tags);
}

// Editar tag
async function editarTag(req: Request, res: Response) {
  const { id: tagId } = validadorParametroId.parse({ id: req.params.tagId });
  const { nome } = validadorEdicaoTag.parse(req.body);

  const tagExistente = await clientePrisma.tag.findUnique({ where: { id: tagId } });
  if (!tagExistente) {
    throw new ErroHttp(404, "tag não encontrada");
  }

  const tagComMesmoNome = await clientePrisma.tag.findFirst({
    where: { nome, id: { not: tagId } },
  });
  if (tagComMesmoNome) {
    throw new ErroHttp(409, "já existe uma tag com esse nome");
  }

  const tagAtualizada = await clientePrisma.tag.update({
    where: { id: tagId },
    data: { nome },
  });

  return res.json(tagAtualizada);
}

// Excluir tag (remove também os vínculos com clientes)
async function excluirTag(req: Request, res: Response) {
  const { id: tagId } = validadorParametroId.parse({ id: req.params.tagId });

  const tagExistente = await clientePrisma.tag.findUnique({ where: { id: tagId } });
  if (!tagExistente) {
    throw new ErroHttp(404, "tag não encontrada");
  }

  const vinculosRemovidos = await clientePrisma.$transaction(async (tx) => {
    const { count } = await tx.clienteTag.deleteMany({ where: { tagId } });
    await tx.tag.delete({ where: { id: tagId } });
    return count;
  });

  return res.json({
    mensagem:
      vinculosRemovidos > 0
        ? `tag excluída; ${vinculosRemovidos} vínculo(s) com cliente(s) também foram removidos`
        : "tag excluída",
  });
}

export const controleTag = { cadastrarTag, listarTags, editarTag, excluirTag };