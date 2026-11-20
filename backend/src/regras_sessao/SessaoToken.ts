// Centraliza a emissão e o encerramento de tokens de sessão. O login, a troca de senha
// (que devolve um token novo) e os testes passam por aqui, para o token ter sempre o mesmo formato.
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { PapelAcesso } from "@prisma/client";
import { clientePrisma } from "../config_servidor/ClientePrisma";
import { obterSegredoJwt } from "../config_servidor/ConfiguracaoAmbiente";

// emite o token de sessão. O `jwtid` aleatório é o que permite derrubar ESTE token no logout
// sem derrubar a sessão da mesma conta em outro aparelho.
// `emitidoEm` em milissegundos porque o `iat` padrão do JWT é em segundos: na troca de senha, o token
// antigo e o novo podem nascer no mesmo segundo e só o milissegundo separa um do outro
export function gerarTokenSessao(usuario: { id: number; papelAcesso: PapelAcesso }): string {
  return jwt.sign(
    { usuarioId: usuario.id, papelAcesso: usuario.papelAcesso, emitidoEm: Date.now() },
    obterSegredoJwt(),
    { expiresIn: "8h", jwtid: randomUUID() }
  );
}

// guarda o token como encerrado até o instante em que ele venceria sozinho
// upsert: um segundo clique em "Sair" com o mesmo token não pode virar erro de chave duplicada
export async function revogarTokenSessao(jti: string, expiraEmSegundos: number) {
  const expiraEm = new Date(expiraEmSegundos * 1000);

  await clientePrisma.tokenRevogado.upsert({
    where: { jti },
    update: {},
    create: { jti, expiraEm },
  });
}
