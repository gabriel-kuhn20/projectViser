import axios from "axios";

// instância única do axios com a URL base da API e o token já anexado
export const clienteHttp = axios.create({
  baseURL: import.meta.env.VITE_URL_API,
});

clienteHttp.interceptors.request.use((configuracao) => {
  const token = localStorage.getItem("token");
  if (token) configuracao.headers.Authorization = `Bearer ${token}`;
  return configuracao;
});
