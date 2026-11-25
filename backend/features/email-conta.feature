# language: pt
Funcionalidade: E-mail da conta sem diferenciar maiúsculas
  "ADMIN@oticaviser.com.br" e "admin@oticaviser.com.br" são a mesma caixa de entrada:
  não podem virar duas contas, e quem digita com outra caixa entra na própria conta (RF01, RF09).

  Cenário: Cadastrar conta com e-mail que já existe em outra caixa
    Dado que entrei como "administrador"
    Quando cadastro uma conta com o e-mail "ATENDENTE@oticaviser.com.br"
    Então o status da resposta deve ser 409
    E a resposta deve dizer "já existe uma conta com esse e-mail"

  Cenário: Trocar o e-mail para um que já existe em outra caixa
    Dado que entrei como "administrador"
    Quando altero o e-mail da conta "atendente" para "ADMIN@oticaviser.com.br"
    Então o status da resposta deve ser 409
    E a resposta deve dizer "já existe uma conta com esse e-mail"

  Cenário: Editar a conta mantendo o próprio e-mail
    Dado que entrei como "administrador"
    Quando altero o e-mail da conta "atendente" para "atendente@oticaviser.com.br"
    Então o status da resposta deve ser 200

  Cenário: Conta cadastrada com maiúsculas entra com o e-mail em minúsculas
    Dado que entrei como "administrador"
    Quando cadastro uma conta com o e-mail "Nova.Conta@OticaViser.com.br"
    Então o status da resposta deve ser 201
    Quando entro com o e-mail "nova.conta@oticaviser.com.br" e a senha "senha-da-conta-nova-123"
    Então o status da resposta deve ser 200

  Cenário: Entrar digitando o e-mail com outra caixa
    Quando entro com o e-mail "Atendente@OticaViser.com.br" e a senha "senha-da-atendente-123"
    Então o status da resposta deve ser 200
    E a resposta deve trazer um token

  Cenário: Conta antiga gravada com maiúsculas continua entrando
    Dado que existe uma conta antiga com o e-mail "Antiga@OticaViser.com.br" e a senha "senha-da-conta-antiga-123"
    Quando entro com o e-mail "antiga@oticaviser.com.br" e a senha "senha-da-conta-antiga-123"
    Então o status da resposta deve ser 200
