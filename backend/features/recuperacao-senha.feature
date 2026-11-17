# language: pt
Funcionalidade: Recuperar senha
  Quem esquece a senha resolve sozinho, por um link enviado ao e-mail da conta (RF20).
  O link vale uma vez só, expira, e a resposta nunca revela quem tem conta no sistema.

  Cenário: Pedir o link com um e-mail cadastrado
    Quando peço a redefinição de senha para "atendente@oticaviser.com.br"
    Então o status da resposta deve ser 200
    E a resposta deve dizer "se o e-mail estiver cadastrado"
    E deve existir 1 link de recuperação para "atendente@oticaviser.com.br"

  Cenário: Pedir o link com um e-mail que não existe
    Quando peço a redefinição de senha para "ninguem@oticaviser.com.br"
    Então o status da resposta deve ser 200
    E a resposta deve dizer "se o e-mail estiver cadastrado"
    E não deve existir nenhum link de recuperação

  Cenário: Redefinir a senha pelo link
    Dado que existe um link de recuperação válido para "atendente@oticaviser.com.br"
    Quando uso o link com a senha "senha-nova-12345"
    Então o status da resposta deve ser 200

  Cenário: Entrar com a senha criada pelo link
    Dado que existe um link de recuperação válido para "atendente@oticaviser.com.br"
    E uso o link com a senha "senha-nova-12345"
    Quando entro com o e-mail "atendente@oticaviser.com.br" e a senha "senha-nova-12345"
    Então o status da resposta deve ser 200
    E a resposta deve trazer um token

  Cenário: A senha antiga para de valer depois da troca
    Dado que existe um link de recuperação válido para "atendente@oticaviser.com.br"
    E uso o link com a senha "senha-nova-12345"
    Quando entro com o e-mail "atendente@oticaviser.com.br" e a senha "senha-da-atendente-123"
    Então o status da resposta deve ser 401

  Cenário: Usar o mesmo link duas vezes
    Dado que existe um link de recuperação válido para "atendente@oticaviser.com.br"
    E uso o link com a senha "senha-nova-12345"
    Quando uso o link com a senha "outra-senha-12345"
    Então o status da resposta deve ser 400
    E a resposta deve dizer "link inválido ou expirado"

  Cenário: Usar um link vencido
    Dado que existe um link de recuperação vencido para "atendente@oticaviser.com.br"
    Quando uso o link com a senha "senha-nova-12345"
    Então o status da resposta deve ser 400
    E a resposta deve dizer "link inválido ou expirado"

  Cenário: Confirmação que não bate com a senha nova
    Dado que existe um link de recuperação válido para "atendente@oticaviser.com.br"
    Quando uso o link com a senha "senha-nova-12345" e a confirmação "outra-coisa-12345"
    Então o status da resposta deve ser 400
    E a resposta deve dizer "as senhas não conferem"

  Cenário: Excluir uma conta que tem link de recuperação em aberto
    Dado que entrei como "administrador"
    E que existe um link de recuperação válido para "atendente@oticaviser.com.br"
    Quando excluo a conta de "atendente@oticaviser.com.br"
    Então o status da resposta deve ser 200
