# language: pt
Funcionalidade: Trocar senha
  Qualquer pessoa da equipe troca a própria senha informando a atual (RF21).
  Redefinir a senha de outra pessoa é só do administrador (RF22), e a senha
  nunca volta em resposta nenhuma da API.

  Cenário: Trocar a própria senha
    Dado que entrei como "atendente"
    Quando troco minha senha de "senha-da-atendente-123" para "senha-nova-12345"
    Então o status da resposta deve ser 200

  Cenário: Entrar com a senha trocada
    Dado que entrei como "atendente"
    E troco minha senha de "senha-da-atendente-123" para "senha-nova-12345"
    Quando entro com o e-mail "atendente@oticaviser.com.br" e a senha "senha-nova-12345"
    Então o status da resposta deve ser 200
    E a resposta deve trazer um token

  Cenário: A senha antiga para de valer
    Dado que entrei como "atendente"
    E troco minha senha de "senha-da-atendente-123" para "senha-nova-12345"
    Quando entro com o e-mail "atendente@oticaviser.com.br" e a senha "senha-da-atendente-123"
    Então o status da resposta deve ser 401

  Cenário: Informar a senha atual errada
    Dado que entrei como "atendente"
    Quando troco minha senha de "nao-e-a-minha-senha" para "senha-nova-12345"
    Então o status da resposta deve ser 400
    E a resposta deve dizer "senha atual incorreta"

  Cenário: Repetir a senha que já estava em uso
    Dado que entrei como "atendente"
    Quando troco minha senha de "senha-da-atendente-123" para "senha-da-atendente-123"
    Então o status da resposta deve ser 400
    E a resposta deve dizer "diferente da atual"

  Cenário: Trocar a senha sem estar logado
    Quando troco a senha sem estar logado
    Então o status da resposta deve ser 401

  Cenário: Administrador envia à pessoa o link para criar senha nova
    Dado que entrei como "administrador"
    Quando envio o link de senha para "atendente@oticaviser.com.br"
    Então o status da resposta deve ser 200
    E deve existir 1 link de recuperação para "atendente@oticaviser.com.br"

  Cenário: O administrador não escolhe a senha de ninguém
    Dado que entrei como "administrador"
    Quando envio o link de senha para "atendente@oticaviser.com.br"
    Então a senha de "atendente@oticaviser.com.br" continua sendo "senha-da-atendente-123"

  Cenário: Atendente não dispara o link de outra pessoa
    Dado que entrei como "atendente"
    Quando envio o link de senha para "admin@oticaviser.com.br"
    Então o status da resposta deve ser 403
