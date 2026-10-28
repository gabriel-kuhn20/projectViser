// Os passos traduzem as frases em português para requisições HTTP de verdade.
// Nada aqui conhece Express ou Prisma: só o contrato JSON por HTTP, como o frontend.
import assert from "node:assert";
import { Given, Then, When, World } from "@cucumber/cucumber";
import { CONTAS, url } from "../suporte/mundo";

type Mundo = World & {
  token?: string;
  resposta: Response;
  corpo: any;
  clientes?: Record<string, number>;
};

type OpcoesApi = { metodo?: string; corpo?: unknown; token?: string };

async function api(caminho: string, { metodo = "GET", corpo, token }: OpcoesApi = {}) {
  return fetch(url(caminho), {
    method: metodo,
    headers: {
      ...(corpo ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(corpo ? { body: JSON.stringify(corpo) } : {}),
  });
}

async function guardarResposta(mundo: Mundo, resposta: Response) {
  mundo.resposta = resposta;
  const texto = await resposta.text();
  try {
    mundo.corpo = JSON.parse(texto);
  } catch {
    mundo.corpo = texto;
  }
}

// data de entrega relativa a hoje, no formato que a tela manda (AAAA-MM-DD)
function diasAPartirDeHoje(dias: number) {
  return new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

async function cadastrarCliente(mundo: Mundo, nome: string, dataEntrega: string) {
  await guardarResposta(
    mundo,
    await api("/clientes", {
      metodo: "POST",
      corpo: { nome, contato: "(51) 99999-0000", dataEntrega, produto: "Armação de acetato" },
      token: mundo.token,
    })
  );
  if (mundo.resposta.status === 201) {
    mundo.clientes = { ...mundo.clientes, [nome]: mundo.corpo.id };
  }
}

async function buscarNomesDosLembretes(mundo: Mundo, nomeMarco: string) {
  const marcos = await (await api("/tipos-marco", { token: mundo.token })).json();
  const marco = marcos.find((m: { nome: string }) => m.nome === nomeMarco);
  assert.ok(marco, `esperava o marco "${nomeMarco}"`);

  const lembretes = await (await api(`/lembretes/marco/${marco.id}`, { token: mundo.token })).json();
  return lembretes.map((l: any) => l.marco.entrega.cliente.pessoa.nome as string);
}

// ---------- Dado ----------

Given("que entrei como {string}", async function (this: Mundo, papel: string) {
  const conta = CONTAS[papel as keyof typeof CONTAS];
  assert.ok(conta, `não existe conta de teste para "${papel}"`);

  const resposta = await api("/autenticacao/login", {
    metodo: "POST",
    corpo: { email: conta.email, senha: conta.senha },
  });
  assert.equal(resposta.status, 200, `login de ${papel} falhou`);
  this.token = (await resposta.json()).token;
});

Given("que a cliente {string} está cadastrada", async function (this: Mundo, nome: string) {
  await cadastrarCliente(this, nome, diasAPartirDeHoje(0));
  assert.equal(this.resposta.status, 201, `cadastro de ${nome} falhou`);
});

// ---------- Quando ----------

When("peço a lista de clientes sem estar logado", async function (this: Mundo) {
  await guardarResposta(this, await api("/clientes"));
});

When("entro com o e-mail {string} e a senha {string}", async function (this: Mundo, email: string, senha: string) {
  await guardarResposta(this, await api("/autenticacao/login", { metodo: "POST", corpo: { email, senha } }));
});

When("cadastro a cliente {string} com entrega há {int} dias", async function (this: Mundo, nome: string, dias: number) {
  await cadastrarCliente(this, nome, diasAPartirDeHoje(-dias));
});

When("cadastro a cliente {string} com entrega daqui a {int} dias", async function (this: Mundo, nome: string, dias: number) {
  await cadastrarCliente(this, nome, diasAPartirDeHoje(dias));
});

When("tento excluir a cliente {string}", async function (this: Mundo, nome: string) {
  const clienteId = this.clientes?.[nome];
  assert.ok(clienteId, `a cliente ${nome} não foi cadastrada no cenário`);
  await guardarResposta(this, await api(`/clientes/${clienteId}`, { metodo: "DELETE", token: this.token }));
});

When("cadastro a tag {string}", async function (this: Mundo, nome: string) {
  await guardarResposta(this, await api("/tags", { metodo: "POST", corpo: { nome }, token: this.token }));
});

// ---------- Então ----------

Then("o status da resposta deve ser {int}", function (this: Mundo, esperado: number) {
  assert.equal(this.resposta.status, esperado);
});

Then("a resposta deve dizer {string}", function (this: Mundo, trecho: string) {
  assert.ok(JSON.stringify(this.corpo).includes(trecho), `a resposta não diz "${trecho}"`);
});

Then("a resposta deve trazer um token", function (this: Mundo) {
  assert.equal(typeof this.corpo.token, "string");
});

Then("a lista de lembretes de {string} deve conter {string}", async function (this: Mundo, marco: string, nome: string) {
  const nomes = await buscarNomesDosLembretes(this, marco);
  assert.ok(nomes.includes(nome), `esperava ${nome} nos lembretes de ${marco}`);
});

Then("a lista de lembretes de {string} não deve conter {string}", async function (this: Mundo, marco: string, nome: string) {
  const nomes = await buscarNomesDosLembretes(this, marco);
  assert.ok(!nomes.includes(nome), `${nome} não deveria estar nos lembretes de ${marco}`);
});
