import { clienteHttp } from "./ClienteHttp";

export async function efetuarLogin(email: string, senha: string) {
  const resposta = await clienteHttp.post("/autenticacao/login", { email, senha });
  return resposta.data;
}

// UC01 · Entrar no sistema (RF01): encerrar a sessão
// o token vem por parâmetro porque a tela limpa a sessão ANTES de chamar: o interceptor
// não teria mais o que anexar, e esperar a resposta para só então sair prenderia a pessoa
// no sistema se a API estivesse fora do ar
export async function encerrarSessao(token: string) {
  await clienteHttp.post("/autenticacao/sair", null, { headers: { Authorization: `Bearer ${token}` } });
}

// UC13 · Trocar a própria senha (RF21)
// `token` é opcional no tipo de propósito: a API devolve um token novo porque a troca derruba
// as sessões da conta, mas a tela não pode gravar um valor indefinido se ele não vier
export async function trocarPropriaSenha(
  senhaAtual: string,
  novaSenha: string
): Promise<{ mensagem: string; token?: string }> {
  const resposta = await clienteHttp.patch("/autenticacao/senha", { senhaAtual, novaSenha });
  return resposta.data;
}

// UC12 · Recuperar senha (RF20)
export async function solicitarRecuperacaoSenha(email: string) {
  const resposta = await clienteHttp.post("/autenticacao/recuperacao-senha", { email });
  return resposta.data;
}

// UC12 · Recuperar senha (RF20): redefinir a senha pelo link recebido
export async function redefinirSenha(token: string, novaSenha: string, confirmacaoSenha: string) {
  const resposta = await clienteHttp.post("/autenticacao/redefinir-senha", {
    token,
    novaSenha,
    confirmacaoSenha,
  });
  return resposta.data;
}
