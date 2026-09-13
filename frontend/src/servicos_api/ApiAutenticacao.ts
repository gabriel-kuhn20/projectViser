import { clienteHttp } from "./ClienteHttp";

export async function efetuarLogin(email: string, senha: string) {
  const resposta = await clienteHttp.post("/autenticacao/login", { email, senha });
  return resposta.data;
}
