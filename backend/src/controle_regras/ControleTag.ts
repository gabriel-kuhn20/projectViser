import { Request, Response } from "express";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { ErroHttp } from "../middlewares_seguranca/ErroHttp";
import { validadorCadastroTag, validadorEdicaoTag } from "../validadores_entrada/ValidadorTag";
import { validadorParametroId } from "../validadores_entrada/ValidadorParametros";

// UC11 · Manter tag (RF12): cadastrar tag
async function cadastrarTag(req: Request, res: Response) {
  const { nome } = validadorCadastroTag.parse(req.body);

  // insensitive: "prime" e "Prime" são a mesma tag para quem filtra a lista — comparar o texto
  // exato deixava cadastrar as duas
  const tagExistente = await clientePrisma.tag.findFirst({ where: { nome: { equals: nome, mode: "insensitive" } } });
  if (tagExistente) {
    throw new ErroHttp(409, "já existe uma tag com esse nome");
  }

  const novaTag = await clientePrisma.tag.create({ data: { nome } });

  return res.status(201).json(novaTag);
}

// UC11 · Manter tag (RF12): listar tags
async function listarTags(req: Request, res: Response) {
  const tags = await clientePrisma.tag.findMany({ orderBy: { nome: "asc" } });
  return res.json(tags);
}

// UC11 · Manter tag (RF12): renomear tag
async function editarTag(req: Request, res: Response) {
  const { id: tagId } = validadorParametroId.parse({ id: req.params.tagId });
  const { nome } = validadorEdicaoTag.parse(req.body);

  const tagExistente = await clientePrisma.tag.findUnique({ where: { id: tagId } });
  if (!tagExistente) {
    throw new ErroHttp(404, "tag não encontrada");
  }

  const tagComMesmoNome = await clientePrisma.tag.findFirst({
    // mesma comparação do cadastro; a própria tag fica de fora para dar para corrigir só a caixa ("prime" → "Prime")
    where: { nome: { equals: nome, mode: "insensitive" }, id: { not: tagId } },
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

// UC11 · Manter tag (RF12): excluir tag (remove também os vínculos com clientes)
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
  
// UC11 · Manter tag (RF12): buscar tag por id
async function buscarTagPorId(req: Request, res: Response) {
  const { id: tagId } = validadorParametroId.parse({ id: req.params.tagId });

  const tag = await clientePrisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) {
    throw new ErroHttp(404, "tag não encontrada");
  }

  return res.json(tag);
}

export const controleTag = { cadastrarTag, listarTags, buscarTagPorId, editarTag, excluirTag };
