// Os passos traduzem as frases em português para requisições HTTP de verdade.
// Nada aqui conhece Express ou Prisma: só o contrato JSON por HTTP, como o frontend.
import assert from "node:assert";
import { Given, Then, When, World } from "@cucumber/cucumber";
import {
  CONTAS,
  contarLinksRecuperacao,
  contarLinksRecuperacaoDe,
  criarLinkRecuperacao,
  obterIdUsuarioPorEmail,
  url,
} from "../suporte/mundo";

type Mundo = World & {
  token?: string;
  resposta: Response;
  corpo: any;
  clientes?: Record<string, number>;
  // o token do link de recuperação do cenário, como se tivesse chegado por e-mail
  tokenRecuperacao?: string;
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

async function buscarLembretesDoMarco(mundo: Mundo, nomeMarco: string) {
  const marcos = await (await api("/tipos-marco", { token: mundo.token })).json();
  const marco = marcos.find((m: { nome: string }) => m.nome === nomeMarco);
  assert.ok(marco, `esperava o marco "${nomeMarco}"`);

  return (await api(`/lembretes/marco/${marco.id}`, { token: mundo.token })).json();
}

async function buscarNomesDosLembretes(mundo: Mundo, nomeMarco: string) {
  const lembretes = await buscarLembretesDoMarco(mundo, nomeMarco);
  return lembretes.map((l: any) => l.marco.entrega.cliente.pessoa.nome as string);
}

async function buscarIdDoLembrete(mundo: Mundo, nomeMarco: string, nomeCliente: string) {
  const lembretes = await buscarLembretesDoMarco(mundo, nomeMarco);
  const lembreteEncontrado = lembretes.find((l: any) => l.marco.entrega.cliente.pessoa.nome === nomeCliente);
  assert.ok(lembreteEncontrado, `${nomeCliente} não tem lembrete pendente em ${nomeMarco}`);
  return lembreteEncontrado.id as number;
}

async function concluirLembreteDaCliente(mundo: Mundo, nomeMarco: string, nomeCliente: string, conteudo?: string) {
  const lembreteId = await buscarIdDoLembrete(mundo, nomeMarco, nomeCliente);
  await guardarResposta(
    mundo,
    await api(`/lembretes/${lembreteId}/concluir`, {
      metodo: "PATCH",
      corpo: conteudo ? { conteudo } : undefined,
      token: mundo.token,
    })
  );
}

async function entrarComo(papel: string) {
  const conta = CONTAS[papel as keyof typeof CONTAS];
  assert.ok(conta, `não existe conta de teste para "${papel}"`);

  const resposta = await api("/autenticacao/login", {
    metodo: "POST",
    corpo: { email: conta.email, senha: conta.senha },
  });
  assert.equal(resposta.status, 200, `login de ${papel} falhou`);
  return (await resposta.json()).token as string;
}

// as contas de teste não têm id fixo: busca pelo e-mail na listagem, como a tela faz
async function buscarIdDaConta(papel: string, token: string) {
  const conta = CONTAS[papel as keyof typeof CONTAS];
  assert.ok(conta, `não existe conta de teste para "${papel}"`);

  const contas = await (await api("/atendentes", { token })).json();
  const encontrada = contas.find((c: { email: string }) => c.email === conta.email);
  assert.ok(encontrada, `a conta de ${papel} não aparece na listagem`);
  return encontrada.id as number;
}

async function alterarSituacaoDaConta(token: string, papel: string, ativo: boolean) {
  // a busca do id usa o token do admin: a listagem é liberada a qualquer usuário logado
  const tokenAdmin = await entrarComo("administrador");
  const usuarioId = await buscarIdDaConta(papel, tokenAdmin);
  return api(`/atendentes/${usuarioId}/ativo`, { metodo: "PATCH", corpo: { ativo }, token });
}

// ---------- Dado ----------

Given("que entrei como {string}", async function (this: Mundo, papel: string) {
  this.token = await entrarComo(papel);
});

Given("que desativei a conta {string}", async function (this: Mundo, papel: string) {
  const resposta = await alterarSituacaoDaConta(this.token!, papel, false);
  assert.equal(resposta.status, 200, `desativar ${papel} falhou`);
});

// o token de quem está logado no cenário fica guardado: o admin age por fora
Given("que o administrador desativou a conta {string}", async function (this: Mundo, papel: string) {
  const tokenAdmin = await entrarComo("administrador");
  const resposta = await alterarSituacaoDaConta(tokenAdmin, papel, false);
  assert.equal(resposta.status, 200, `desativar ${papel} falhou`);
});

Given("que a cliente {string} está cadastrada", async function (this: Mundo, nome: string) {
  await cadastrarCliente(this, nome, diasAPartirDeHoje(0));
  assert.equal(this.resposta.status, 201, `cadastro de ${nome} falhou`);
});

Given("que a cliente {string} está cadastrada com entrega há {int} dias", async function (this: Mundo, nome: string, dias: number) {
  await cadastrarCliente(this, nome, diasAPartirDeHoje(-dias));
  assert.equal(this.resposta.status, 201, `cadastro de ${nome} falhou`);
});

// ---------- Quando ----------

When(
  "tento concluir o lembrete de {string} da cliente {string} sem registrar contato",
  async function (this: Mundo, marco: string, nome: string) {
    await concluirLembreteDaCliente(this, marco, nome);
  }
);

When(
  "concluo o lembrete de {string} da cliente {string} com o contato {string}",
  async function (this: Mundo, marco: string, nome: string, conteudo: string) {
    await concluirLembreteDaCliente(this, marco, nome, conteudo);
  }
);

When("peço a lista de clientes sem estar logado", async function (this: Mundo) {
  await guardarResposta(this, await api("/clientes"));
});

When("peço a lista de clientes", async function (this: Mundo) {
  await guardarResposta(this, await api("/clientes", { token: this.token }));
});

When("desativo a conta {string}", async function (this: Mundo, papel: string) {
  await guardarResposta(this, await alterarSituacaoDaConta(this.token!, papel, false));
});

When("reativo a conta {string}", async function (this: Mundo, papel: string) {
  await guardarResposta(this, await alterarSituacaoDaConta(this.token!, papel, true));
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

Then("o histórico da cliente {string} deve conter {string}", async function (this: Mundo, nome: string, trecho: string) {
  const clienteId = this.clientes?.[nome];
  assert.ok(clienteId, `a cliente ${nome} não foi cadastrada no cenário`);

  const historico = await (await api(`/interacoes/cliente/${clienteId}`, { token: this.token })).json();
  assert.ok(JSON.stringify(historico).includes(trecho), `o histórico de ${nome} não tem "${trecho}"`);
});

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

// ---------- UC12 · Recuperar senha (RF20) ----------

async function usarLinkRecuperacao(mundo: Mundo, novaSenha: string, confirmacaoSenha: string) {
  await guardarResposta(
    mundo,
    await api("/autenticacao/redefinir-senha", {
      metodo: "POST",
      corpo: { token: mundo.tokenRecuperacao, novaSenha, confirmacaoSenha },
    })
  );
}

Given("que existe um link de recuperação válido para {string}", async function (this: Mundo, email: string) {
  this.tokenRecuperacao = await criarLinkRecuperacao(email, 30);
});

Given("que existe um link de recuperação vencido para {string}", async function (this: Mundo, email: string) {
  // minutos negativos: o link já nasce com a validade no passado, e o cenário
  // não precisa esperar os 30 minutos de verdade para testar o vencimento
  this.tokenRecuperacao = await criarLinkRecuperacao(email, -1);
});

When("peço a redefinição de senha para {string}", async function (this: Mundo, email: string) {
  await guardarResposta(
    this,
    await api("/autenticacao/recuperacao-senha", { metodo: "POST", corpo: { email } })
  );
});

When("uso o link com a senha {string}", async function (this: Mundo, novaSenha: string) {
  await usarLinkRecuperacao(this, novaSenha, novaSenha);
});

When(
  "uso o link com a senha {string} e a confirmação {string}",
  async function (this: Mundo, novaSenha: string, confirmacaoSenha: string) {
    await usarLinkRecuperacao(this, novaSenha, confirmacaoSenha);
  }
);

Then("deve existir {int} link de recuperação para {string}", async function (esperado: number, email: string) {
  assert.equal(await contarLinksRecuperacaoDe(email), esperado);
});

Then("não deve existir nenhum link de recuperação", async function () {
  assert.equal(await contarLinksRecuperacao(), 0);
});

When("excluo a conta de {string}", async function (this: Mundo, email: string) {
  const usuarioId = await obterIdUsuarioPorEmail(email);
  await guardarResposta(this, await api(`/atendentes/${usuarioId}`, { metodo: "DELETE", token: this.token }));
});
