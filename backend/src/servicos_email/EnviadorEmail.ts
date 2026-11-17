// Centraliza o envio de e-mail do sistema: quem chama não sabe, e não precisa saber,
// por onde o e-mail sai. Com RESEND_API_KEY e EMAIL_REMETENTE no ambiente, sai pelo
// Resend; sem as duas, o conteúdo é impresso no console — é assim que o fluxo roda em
// desenvolvimento, sem credencial e sem e-mail de verdade saindo da máquina.
import { Resend } from "resend";

type EmailParaEnviar = {
  destino: string;
  assunto: string;
  corpoTexto: string;
};

// Ler a configuração do provedor, ou nulo quando ela não existe
// as duas variáveis andam juntas: chave sem remetente (ou o contrário) não envia nada,
// e tratar isso como "não configurado" evita uma falha obscura no primeiro envio
function obterConfiguracaoResend() {
  const chaveApi = process.env.RESEND_API_KEY;
  const remetente = process.env.EMAIL_REMETENTE;

  if (!chaveApi || !remetente) return null;

  return { chaveApi, remetente };
}

// Imprimir o e-mail no console, no lugar do envio
function imprimirEmailNoConsole({ destino, assunto, corpoTexto }: EmailParaEnviar) {
  console.log("\n----- e-mail (sem provedor configurado) -----");
  console.log("para:", destino);
  console.log("assunto:", assunto);
  console.log(corpoTexto);
  console.log("--------------------------------------------\n");
}

// Despachar o e-mail pelo provedor configurado
async function despacharEmail(email: EmailParaEnviar) {
  const configuracaoResend = obterConfiguracaoResend();

  if (!configuracaoResend) {
    imprimirEmailNoConsole(email);
    return;
  }

  const { error: erroEnvio } = await new Resend(configuracaoResend.chaveApi).emails.send({
    from: configuracaoResend.remetente,
    to: email.destino,
    subject: email.assunto,
    text: email.corpoTexto,
  });

  // o SDK do Resend devolve a falha no retorno em vez de lançar — sem conferir, uma chave
  // inválida ou um domínio não verificado passariam por envio bem-sucedido
  if (erroEnvio) {
    // o erro fica no log e NÃO vira resposta de erro: a rota de recuperação responde igual
    // para e-mail cadastrado e não cadastrado, e falhar só quando a conta existe entregaria
    // justamente o que a resposta genérica esconde
    console.error("falha ao enviar e-mail pelo Resend:", erroEnvio);
  }
}

// Montar o texto do e-mail de recuperação
function montarTextoRecuperacaoSenha(linkRecuperacao: string, minutosValidade: number) {
  return [
    "Recebemos um pedido para redefinir a senha da sua conta no sistema da Ótica Viser.",
    "",
    "Para escolher uma senha nova, acesse:",
    linkRecuperacao,
    "",
    `O link vale ${minutosValidade} minutos e pode ser usado uma única vez.`,
    "",
    "Se não foi você que pediu, ignore esta mensagem: sua senha atual continua valendo.",
  ].join("\n");
}

// UC12 · Recuperar senha (RF20)
export async function enviarEmailRecuperacaoSenha(
  emailDestino: string,
  linkRecuperacao: string,
  minutosValidade: number
) {
  await despacharEmail({
    destino: emailDestino,
    assunto: "Redefinição de senha — Ótica Viser",
    corpoTexto: montarTextoRecuperacaoSenha(linkRecuperacao, minutosValidade),
  });
}
