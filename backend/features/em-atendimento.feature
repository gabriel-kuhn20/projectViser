# language: pt
Funcionalidade: Lembrete em atendimento
  Quem assume um lembrete fica com o contato: outra atendente não registra
  nem conclui por cima, para a cliente não receber duas ligações (UC08, RF08).
  O administrador continua podendo agir em qualquer lembrete.

  Cenário: Atendente tenta concluir um lembrete assumido por outra pessoa
    Dado que entrei como "atendente"
    E que a cliente "Fernanda Moura" está cadastrada com entrega há 8 dias
    E que a conta "administrador" assumiu o lembrete de "7 dias" da cliente "Fernanda Moura"
    Quando concluo o lembrete de "7 dias" da cliente "Fernanda Moura" com o contato "Liguei e ela está satisfeita com a armação"
    Então o status da resposta deve ser 409
    E a resposta deve dizer "lembrete está em atendimento com outra pessoa"
    E a lista de lembretes de "7 dias" deve conter "Fernanda Moura"

  Cenário: Atendente tenta registrar contato num lembrete assumido por outra pessoa
    Dado que entrei como "atendente"
    E que a cliente "Fernanda Moura" está cadastrada com entrega há 8 dias
    E que a conta "administrador" assumiu o lembrete de "7 dias" da cliente "Fernanda Moura"
    Quando registro o contato "Liguei e não atendeu" no lembrete de "7 dias" da cliente "Fernanda Moura"
    Então o status da resposta deve ser 409
    E a resposta deve dizer "lembrete está em atendimento com outra pessoa"

  Cenário: Quem assumiu registra e conclui normalmente
    Dado que entrei como "atendente"
    E que a cliente "Fernanda Moura" está cadastrada com entrega há 8 dias
    E que a conta "atendente" assumiu o lembrete de "7 dias" da cliente "Fernanda Moura"
    Quando concluo o lembrete de "7 dias" da cliente "Fernanda Moura" com o contato "Liguei e ela está satisfeita com a armação"
    Então o status da resposta deve ser 200

  Cenário: Administrador conclui um lembrete assumido pela atendente
    Dado que entrei como "administrador"
    E que a cliente "Fernanda Moura" está cadastrada com entrega há 8 dias
    E que a conta "atendente" assumiu o lembrete de "7 dias" da cliente "Fernanda Moura"
    Quando concluo o lembrete de "7 dias" da cliente "Fernanda Moura" com o contato "Liguei e ela está satisfeita com a armação"
    Então o status da resposta deve ser 200
