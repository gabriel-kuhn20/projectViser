# language: pt
Funcionalidade: Cadastrar cliente
  A cliente é cadastrada junto com a primeira entrega dos óculos (RF02).
  A data de entrega é a base de todos os lembretes, então precisa ser válida.

  Cenário: Cadastrar cliente com entrega de hoje
    Dado que entrei como "atendente"
    Quando cadastro a cliente "Beatriz Rodrigues" com entrega há 0 dias
    Então o status da resposta deve ser 201

  Cenário: Data de entrega no futuro
    Dado que entrei como "atendente"
    Quando cadastro a cliente "Beatriz Rodrigues" com entrega daqui a 3 dias
    Então o status da resposta deve ser 400
    E a resposta deve dizer "a data de entrega não pode ser futura"
