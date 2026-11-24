# language: pt
Funcionalidade: Marcar lembrete como em atendimento
  Duas atendentes não podem ligar para a mesma cliente ao mesmo tempo: quem marca
  primeiro fica com o contato, e a outra fica sabendo quem está atendendo (UC08 A1, RF08).

  Cenário: A segunda atendente não consegue pegar o mesmo lembrete
    Dado que entrei como "atendente"
    E que a cliente "Fernanda Moura" está cadastrada com entrega há 8 dias
    E que marquei o lembrete de "7 dias" da cliente "Fernanda Moura" como em atendimento
    Quando "outra atendente" tenta marcar o lembrete de "7 dias" da cliente "Fernanda Moura" como em atendimento
    Então o status da resposta deve ser 409
    E a resposta deve dizer "lembrete já está sendo tratado por Ana"

  Cenário: Quem marcou desiste e a outra atendente consegue pegar
    Dado que entrei como "atendente"
    E que a cliente "Fernanda Moura" está cadastrada com entrega há 8 dias
    E que marquei o lembrete de "7 dias" da cliente "Fernanda Moura" como em atendimento
    Quando desmarco o lembrete de "7 dias" da cliente "Fernanda Moura"
    E "outra atendente" tenta marcar o lembrete de "7 dias" da cliente "Fernanda Moura" como em atendimento
    Então o status da resposta deve ser 201

  Cenário: As duas marcam no mesmo instante e só uma fica com o contato
    Dado que entrei como "atendente"
    E que a cliente "Fernanda Moura" está cadastrada com entrega há 8 dias
    Quando "atendente" e "outra atendente" marcam o lembrete de "7 dias" da cliente "Fernanda Moura" ao mesmo tempo
    Então só uma delas deve ficar com o contato
    E a outra deve saber quem está atendendo
