import { clienteHttp } from "./ClienteHttp";

export async function efetuarLogin(email: string, senha: string) {
  const resposta = await clienteHttp.post("/autenticacao/login", { email, senha });
  return resposta.data;
}

// UC12 · Recuperar senha (RF20)
export async function solicitarRecuperacaoSenha(email: string) {
  const resposta = await clienteHttp.post("/autenticacao/recuperacao-senha", { email });
  return resposta.data;
}

// UC12 · Redefinir a senha pelo link recebido (RF20)
export async function redefinirSenha(token: string, novaSenha: string, confirmacaoSenha: string) {
  const resposta = await clienteHttp.post("/autenticacao/redefinir-senha", {
    token,
    novaSenha,
    confirmacaoSenha,
  });
  return resposta.data;
}
