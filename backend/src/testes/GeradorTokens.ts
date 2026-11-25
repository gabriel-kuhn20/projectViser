import { PapelAcesso } from "@prisma/client";
import { gerarTokenSessao } from "../regras_sessao/SessaoToken";

// gera um token igual ao do efetuarLogin, para os testes entrarem como admin ou
// atendente sem precisar de usuário no banco. Uso:
// .set("Authorization", gerarCabecalhoToken("atendente", 2))
// passa pelo gerarTokenSessao de propósito: o middleware recusa token sem `jti`, então
// montar o JWT à mão aqui faria todo teste autenticado responder 401
export function gerarCabecalhoToken(papelAcesso: PapelAcesso, usuarioId: number): string {
  return `Bearer ${gerarTokenSessao({ id: usuarioId, papelAcesso })}`;
}
