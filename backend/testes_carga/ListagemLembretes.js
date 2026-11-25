import http from "k6/http";
import { check, sleep } from "k6";

// RNF01: 5 atendentes usando o sistema ao mesmo tempo, por 1 minuto, chamando a listagem de
// lembretes por marco; passa se o p(95) ficar em até 2 s (threshold do próprio k6).
// Antes: npm run carga:popular. Uso: k6 run testes_carga/ListagemLembretes.js
// (outro endereço: k6 run -e URL_API=http://177.44.248.93/api testes_carga/ListagemLembretes.js)

const URL_API = __ENV.URL_API || "http://localhost:3333/api";
const SENHA_ATENDENTES = __ENV.CARGA_SENHA || "carga12345";

export const options = {
  vus: 5,
  duration: "1m",
  thresholds: {
    // só a listagem conta: o login de cada atendente acontece uma vez, no setup
    "http_req_duration{rota:listagem}": ["p(95)<2000"],
    checks: ["rate==1"],
  },
};

// cada usuário virtual entra com a própria conta, como os 5 atendentes da loja
export function setup() {
  const tokens = [];
  for (let numeroAtendente = 1; numeroAtendente <= 5; numeroAtendente++) {
    const respostaLogin = http.post(
        `${URL_API}/autenticacao/login`,
        JSON.stringify({ email: `atendente${numeroAtendente}@carga.local`, senha: SENHA_ATENDENTES }),
        { headers: { "Content-Type": "application/json" } }
    );
    if (respostaLogin.status !== 200) {
      throw new Error(`login do atendente${numeroAtendente} falhou (${respostaLogin.status}): rode npm run carga:popular`);
    }
    tokens.push(respostaLogin.json("token"));
  }
  // os marcos são cadastrados pelo administrador: as abas (e as rotas) usam o id de cada um
  const respostaMarcos = http.get(`${URL_API}/tipos-marco`, { headers: { Authorization: `Bearer ${tokens[0]}` } });
  const idsMarco = respostaMarcos.json().filter((tipoMarco) => tipoMarco.ativo).map((tipoMarco) => tipoMarco.id);
  return { tokens, idsMarco };
}

export default function ({ tokens, idsMarco }) {
  const token = tokens[(__VU - 1) % tokens.length];
  const tipoMarcoId = idsMarco[__ITER % idsMarco.length];

  const respostaListagem = http.get(`${URL_API}/lembretes/marco/${tipoMarcoId}`, {
    headers: { Authorization: `Bearer ${token}` },
    tags: { rota: "listagem" },
  });
  check(respostaListagem, { "listagem respondeu 200": (resposta) => resposta.status === 200 });

  // intervalo entre uma consulta e outra, como alguém trocando de aba na tela
  sleep(1);
}
