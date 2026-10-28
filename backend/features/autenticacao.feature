# language: pt
Funcionalidade: Entrar no sistema
  Só a equipe da ótica acessa os dados das clientes (RF01, RNF03).
  Quem decide quem entra é o servidor, não a tela.

  Cenário: Ver os clientes sem estar logado
    Quando peço a lista de clientes sem estar logado
    Então o status da resposta deve ser 401

  Cenário: Entrar com a senha certa
    Quando entro com o e-mail "atendente@oticaviser.com.br" e a senha "senha-da-atendente-123"
    Então o status da resposta deve ser 200
    E a resposta deve trazer um token

  Cenário: Entrar com a senha errada
    Quando entro com o e-mail "atendente@oticaviser.com.br" e a senha "senha-errada"
    Então o status da resposta deve ser 401
    E a resposta deve dizer "email ou senha inválidos"
