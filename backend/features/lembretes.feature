# language: pt
Funcionalidade: Lembretes de acompanhamento
  Depois da entrega, cada marco (7 dias, 2 meses, 1 ano) gera um lembrete
  para a equipe entrar em contato com a cliente (RF03, RF04).

  Cenário: Entrega de 8 dias atrás gera o lembrete de 7 dias
    Dado que entrei como "atendente"
    Quando cadastro a cliente "Carla Dias" com entrega há 8 dias
    Então a lista de lembretes de "7 dias" deve conter "Carla Dias"

  Cenário: Entrega de ontem ainda não gera lembrete
    Dado que entrei como "atendente"
    Quando cadastro a cliente "Davi Souza" com entrega há 1 dias
    Então a lista de lembretes de "7 dias" não deve conter "Davi Souza"

  Cenário: Entrega de 70 dias atrás gera os lembretes de 7 dias e de 2 meses
    Dado que entrei como "atendente"
    Quando cadastro a cliente "Elisa Martins" com entrega há 70 dias
    Então a lista de lembretes de "7 dias" deve conter "Elisa Martins"
    E a lista de lembretes de "2 meses" deve conter "Elisa Martins"
