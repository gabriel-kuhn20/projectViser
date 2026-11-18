import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { obterSegredoJwt } from "../config_servidor/ConfiguracaoAmbiente";

// RNF03: usuário não autenticado não acessa dados de cliente
export async function middlewareAutenticacao(req: Request, res: Response, next: NextFunction) {
  const cabecalhoAutorizacao = req.headers.authorization;

  if (!cabecalhoAutorizacao) {
    return res.status(401).json({ mensagem: "token não informado" });
  }

  const [esquema, token] = cabecalhoAutorizacao.split(" ");
  if (esquema !== "Bearer" || !token) {
    return res.status(401).json({ mensagem: "formato do token inválido" });
  }

  // fora do try: segredo ausente é erro de configuração (500), não token inválido
  const segredoJwt = obterSegredoJwt();

  let payloadToken: { usuarioId: number; jti?: string; emitidoEm?: number; exp?: number };
  try {
    payloadToken = jwt.verify(token, segredoJwt) as typeof payloadToken;
  } catch {
    return res.status(401).json({ mensagem: "token inválido ou expirado" });
  }

  // token sem `jti` é de antes da revogação existir: o logout não teria como derrubá-lo, então não vale
  if (!payloadToken.jti) {
    return res.status(401).json({ mensagem: "token inválido ou expirado" });
  }

  // UC01 · Entrar no sistema (RF01): o token de quem clicou em "Sair" não abre mais nada
  const tokenRevogado = await clientePrisma.tokenRevogado.findUnique({ where: { jti: payloadToken.jti } });
  if (tokenRevogado) {
    return res.status(401).json({ mensagem: "sessão encerrada — entre novamente" });
  }

  // o token vale 8h: conta excluída, desativada ou com papel alterado nesse meio-tempo precisa valer já,
  // por isso o papel vem do banco e não do token
  const usuarioAtual = await clientePrisma.usuario.findUnique({
    where: { id: payloadToken.usuarioId },
    select: { id: true, papelAcesso: true, ativo: true, sessoesValidasDesde: true },
  });
  if (!usuarioAtual) {
    return res.status(401).json({ mensagem: "usuário do token não existe mais" });
  }
  if (!usuarioAtual.ativo) {
    return res.status(401).json({ mensagem: "conta desativada — fale com o administrador" });
  }

  // trocar a senha derruba as sessões abertas: só vale o token emitido a partir da troca
  const cortePorTrocaDeSenha = usuarioAtual.sessoesValidasDesde?.getTime() ?? 0;
  if ((payloadToken.emitidoEm ?? 0) < cortePorTrocaDeSenha) {
    return res.status(401).json({ mensagem: "senha alterada — entre novamente" });
  }

  // jti e exp seguem junto para o logout saber qual token encerrar
  req.usuarioLogado = {
    usuarioId: usuarioAtual.id,
    papelAcesso: usuarioAtual.papelAcesso,
    jti: payloadToken.jti,
    exp: payloadToken.exp,
  };
  next();
}
