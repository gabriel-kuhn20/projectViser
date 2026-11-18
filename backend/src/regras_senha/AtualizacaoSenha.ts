// Centraliza a gravação de senha nova. Os três caminhos que mexem em senha passam por
// aqui — recuperação por e-mail, troca pela própria pessoa e redefinição pelo admin —
// para que nenhum deles esqueça de queimar os links de recuperação que ficaram em aberto
// e de derrubar as sessões que estavam abertas com a senha antiga.
import bcrypt from "bcrypt";
import { clientePrisma } from "../config_servidor/ClientePrisma";

export async function atualizarSenhaUsuario(usuarioId: number, novaSenha: string) {
  const senhaComHash = await bcrypt.hash(novaSenha, 10);

  // transação: gravar a senha, queimar os links e derrubar as sessões valem juntos ou nenhum —
  // um link ou um token que sobrevivesse à troca continuaria abrindo a conta
  await clientePrisma.$transaction([
    clientePrisma.usuario.update({
      where: { id: usuarioId },
      data: { senha: senhaComHash, sessoesValidasDesde: new Date() },
    }),
    clientePrisma.tokenRecuperacaoSenha.updateMany({
      where: { usuarioId, usadoEm: null },
      data: { usadoEm: new Date() },
    }),
  ]);
}
