// Erro "de negócio" com status HTTP definido — controllers lançam isso
// (throw) quando querem responder algo diferente de 500 genérico.
// O MiddlewareTratamentoErros sabe reconhecer essa classe e usar o status certo.
export class ErroHttp extends Error {
  constructor(public statusCode: number, mensagem: string) {
    super(mensagem);
    this.name = "ErroHttp";
  }
}   