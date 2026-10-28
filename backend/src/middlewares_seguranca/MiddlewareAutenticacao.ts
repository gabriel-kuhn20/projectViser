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

  let usuarioIdToken: number;
  try {
    usuarioIdToken = (jwt.verify(token, segredoJwt) as { usuarioId: number }).usuarioId;
  } catch {
    return res.status(401).json({ mensagem: "token inválido ou expirado" });
  }

  // o token vale 8h: conta excluída ou papel alterado nesse meio-tempo precisa valer já,
  // por isso o papel vem do banco e não do token
  const usuarioAtual = await clientePrisma.usuario.findUnique({
    where: { id: usuarioIdToken },
    select: { id: true, papelAcesso: true },
  });
  if (!usuarioAtual) {
    return res.status(401).json({ mensagem: "usuário do token não existe mais" });
  }

  req.usuarioLogado = { usuarioId: usuarioAtual.id, papelAcesso: usuarioAtual.papelAcesso };
  next();
}
