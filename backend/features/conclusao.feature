# language: pt
Funcionalidade: Concluir lembrete de contato
  O lembrete só sai da lista quando a equipe registra o que foi conversado
  com a cliente (UC07 A1, RF07).

  Cenário: Concluir sem registrar a interação
    Dado que entrei como "atendente"
    E que a cliente "Fernanda Moura" está cadastrada com entrega há 8 dias
    Quando tento concluir o lembrete de "7 dias" da cliente "Fernanda Moura" sem registrar contato
    Então o status da resposta deve ser 400
    E a resposta deve dizer "registre uma interação antes de concluir o lembrete"
    E a lista de lembretes de "7 dias" deve conter "Fernanda Moura"

  Cenário: Concluir com a interação registrada
    Dado que entrei como "atendente"
    E que a cliente "Fernanda Moura" está cadastrada com entrega há 8 dias
    Quando concluo o lembrete de "7 dias" da cliente "Fernanda Moura" com o contato "Liguei e ela está satisfeita com a armação"
    Então o status da resposta deve ser 200
    E a lista de lembretes de "7 dias" não deve conter "Fernanda Moura"

  Cenário: A interação aparece no histórico da cliente
    Dado que entrei como "atendente"
    E que a cliente "Fernanda Moura" está cadastrada com entrega há 8 dias
    Quando concluo o lembrete de "7 dias" da cliente "Fernanda Moura" com o contato "Liguei e ela está satisfeita com a armação"
    Então o histórico da cliente "Fernanda Moura" deve conter "Liguei e ela está satisfeita com a armação"