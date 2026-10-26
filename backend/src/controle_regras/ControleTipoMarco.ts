import { Request, Response } from "express";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { executarVerificacaoMarcos } from "../rotina_marcos/AgendadorMarcos";
import { ErroHttp } from "../middlewares_seguranca/ErroHttp";
import { validadorCadastroTipoMarco, validadorEdicaoTipoMarco } from "../validadores_entrada/ValidadorTipoMarco";
import { validadorParametroId } from "../validadores_entrada/ValidadorParametros";

// Buscar marco existente, já com quantos marcos de clientes ele gerou
async function buscarTipoMarcoExistente(tipoMarcoId: number) {
  const tipoMarcoEncontrado = await clientePrisma.tipoMarco.findUnique({
    where: { id: tipoMarcoId },
    include: { _count: { select: { marcos: true } } },
  });
  if (!tipoMarcoEncontrado) throw new ErroHttp(404, "marco não encontrado");
  return tipoMarcoEncontrado;
}

// Listar marcos (todos os usuários: as abas de lembretes e o painel saem daqui)
async function listarTiposMarco(req: Request, res: Response) {
  const tiposMarco = await clientePrisma.tipoMarco.findMany({
    orderBy: { diasAposEntrega: "asc" },
    include: { _count: { select: { marcos: true } } },
  });
  return res.json(tiposMarco);
}

// RF03 (UC04): o administrador define em quantos dias após a entrega cada contato acontece
// dias repetidos caem no P2002 (diasAposEntrega é único) e o middleware responde 409
async function cadastrarTipoMarco(req: Request, res: Response) {
  const dadosMarco = validadorCadastroTipoMarco.parse(req.body);
  const novoTipoMarco = await clientePrisma.tipoMarco.create({ data: dadosMarco });

  // entregas cadastradas a partir de agora já entram; as antigas só se o marco vencer daqui em diante
  await executarVerificacaoMarcos();
  return res.status(201).json(novoTipoMarco);
}

// Editar marco: nome e ativo sempre; os dias só enquanto nenhum lembrete foi gerado —
// mudar depois deixaria as datas dos lembretes e do histórico diferentes da regra nova
async function editarTipoMarco(req: Request, res: Response) {
  const { id: tipoMarcoId } = validadorParametroId.parse({ id: req.params.tipoMarcoId });
  const { nome, diasAposEntrega, ativo } = validadorEdicaoTipoMarco.parse(req.body);

  const tipoMarcoExistente = await buscarTipoMarcoExistente(tipoMarcoId);
  const diasAlterados = diasAposEntrega !== undefined && diasAposEntrega !== tipoMarcoExistente.diasAposEntrega;
  const jaGerouMarcos = tipoMarcoExistente._count.marcos > 0;
  if (diasAlterados && jaGerouMarcos) {
    throw new ErroHttp(409, "esse marco já gerou lembretes: os dias não podem mudar. desative-o e crie um novo");
  }

  const tipoMarcoAtualizado = await clientePrisma.tipoMarco.update({
    where: { id: tipoMarcoId },
    data: { nome, diasAposEntrega, ativo },
  });

  const reativado = ativo === true && !tipoMarcoExistente.ativo;
  if (diasAlterados || reativado) await executarVerificacaoMarcos();
  return res.json(tipoMarcoAtualizado);
}

// Excluir marco: só os que nunca geraram lembrete; os outros guardam histórico e são desativados
async function excluirTipoMarco(req: Request, res: Response) {
  const { id: tipoMarcoId } = validadorParametroId.parse({ id: req.params.tipoMarcoId });

  const tipoMarcoExistente = await buscarTipoMarcoExistente(tipoMarcoId);
  if (tipoMarcoExistente._count.marcos > 0) {
    throw new ErroHttp(409, "esse marco já gerou lembretes e faz parte do histórico: desative-o em vez de excluir");
  }

  await clientePrisma.tipoMarco.delete({ where: { id: tipoMarcoId } });
  return res.json({ mensagem: "marco excluído" });
}

export const controleTipoMarco = {
  listarTiposMarco,
  cadastrarTipoMarco,
  editarTipoMarco,
  excluirTipoMarco,
};
