import axios from "axios";
import { lerTokenSessao, limparTokenSessao } from "../utilitarios_autenticacao/SessaoArmazenada";

// instância única do axios com a URL base da API e o token já anexado
export const clienteHttp = axios.create({
  baseURL: import.meta.env.VITE_URL_API,
});

clienteHttp.interceptors.request.use((configuracao) => {
  const token = lerTokenSessao();
  if (token) configuracao.headers.Authorization = `Bearer ${token}`;
  return configuracao;
});

// trata sessão expirada: um 401 fora da própria tela de login significa
// token inválido/vencido — limpa a sessão e redireciona
clienteHttp.interceptors.response.use(
    (resposta) => resposta,
    (erro) => {
      const requisicaoParaLogin = erro.config?.url?.includes("/autenticacao/login");
      const jaEstaNaTelaLogin = window.location.pathname === "/login";

      if (erro.response?.status === 401 && !requisicaoParaLogin && !jaEstaNaTelaLogin) {
        limparTokenSessao();
        window.location.href = "/login";
      }

      return Promise.reject(erro);
    }
);