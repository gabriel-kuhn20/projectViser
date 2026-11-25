# language: pt
Funcionalidade: Encerrar a sessão
  Sair do sistema derruba o token no servidor, não só na tela, e trocar a senha
  derruba as sessões que estavam abertas com a senha antiga (RF01, RF21, RNF10).
  Tokens que já venceram saem do banco, para as tabelas não crescerem para sempre.

  Cenário: O token de quem saiu não abre mais nada
    Dado que entrei como "atendente"
    Quando saio do sistema
    Então o status da resposta deve ser 204
    Quando peço a lista de clientes
    Então o status da resposta deve ser 401
    E a resposta deve dizer "sessão encerrada"

  Cenário: Sair não derruba a mesma conta aberta em outro aparelho
    Dado que entrei como "atendente"
    E que entrei de novo como "atendente" em outro aparelho
    Quando saio do sistema
    E peço a lista de clientes pelo outro aparelho
    Então o status da resposta deve ser 200

  Cenário: Sair sem estar logado
    Quando saio do sistema sem estar logado
    Então o status da resposta deve ser 401

  Cenário: Trocar a senha derruba a sessão aberta em outro aparelho
    Dado que entrei como "atendente"
    E que entrei de novo como "atendente" em outro aparelho
    Quando troco minha senha de "senha-da-atendente-123" para "senha-nova-12345"
    E peço a lista de clientes pelo outro aparelho
    Então o status da resposta deve ser 401
    E a resposta deve dizer "senha alterada"

  Cenário: Quem trocou a senha continua logado com o token novo
    Dado que entrei como "atendente"
    Quando troco minha senha de "senha-da-atendente-123" para "senha-nova-12345" e guardo o token novo
    Então o status da resposta deve ser 200
    Quando peço a lista de clientes com o token novo
    Então o status da resposta deve ser 200

  Cenário: A limpeza apaga o que venceu e guarda o que ainda vale
    Dado que entrei como "atendente"
    E que existe um link de recuperação vencido para "atendente@oticaviser.com.br"
    E que existe um link de recuperação válido para "atendente@oticaviser.com.br"
    E que existe um token de sessão encerrado que já venceu
    E saio do sistema
    Quando a limpeza de tokens vencidos roda
    Então deve existir 1 link de recuperação para "atendente@oticaviser.com.br"
    E deve sobrar 1 token de sessão encerrado
