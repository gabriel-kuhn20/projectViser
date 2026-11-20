import cron from "node-cron";
import { clientePrisma } from "../config_servidor/ClientePrisma";

// Rotina agendada, como a dos marcos: sem ela as tabelas `token_recuperacao_senha` e
// `token_revogado` só cresceriam. Roda de madrugada, quando ninguém está usando o sistema.
export function iniciarLimpezaTokens() {
  // uma vez ao subir o servidor, para não depender de ele estar ligado às 03:30
  executarLimpezaTokens();
  cron.schedule("30 3 * * *", executarLimpezaTokens);
}

// nunca lança: falha na limpeza não pode virar promise rejeitada sem tratamento e derrubar o processo
export function executarLimpezaTokens() {
  return removerTokensVencidos().catch((erroLimpeza) => {
    console.error("falha ao limpar tokens vencidos:", erroLimpeza);
  });
}

// só apaga o que já venceu: link de recuperação vencido já responde "inválido ou expirado" e
// token de sessão vencido já é recusado pelo próprio JWT, então nenhum dos dois faz falta no banco
export async function removerTokensVencidos() {
  const agora = new Date();

  const [recuperacoesRemovidas, revogadosRemovidos] = await clientePrisma.$transaction([
    clientePrisma.tokenRecuperacaoSenha.deleteMany({ where: { expiraEm: { lt: agora } } }),
    clientePrisma.tokenRevogado.deleteMany({ where: { expiraEm: { lt: agora } } }),
  ]);

  return { recuperacoesRemovidas: recuperacoesRemovidas.count, revogadosRemovidos: revogadosRemovidos.count };
}
