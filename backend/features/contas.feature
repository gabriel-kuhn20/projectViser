# language: pt
Funcionalidade: Desativar e reativar conta
  Quem sai da ótica perde o acesso sem apagar a conta: o histórico continua
  mostrando quem fez cada contato. Só o administrador desativa e reativa (RF11).

  Cenário: Conta desativada não entra
    Dado que entrei como "administrador"
    Quando desativo a conta "atendente"
    Então o status da resposta deve ser 200
    Quando entro com o e-mail "atendente@oticaviser.com.br" e a senha "senha-da-atendente-123"
    Então o status da resposta deve ser 401
    E a resposta deve dizer "conta desativada"

  Cenário: Quem já estava logado perde o acesso na hora
    Dado que entrei como "atendente"
    E que o administrador desativou a conta "atendente"
    Quando peço a lista de clientes
    Então o status da resposta deve ser 401

  Cenário: Conta reativada volta a entrar
    Dado que entrei como "administrador"
    E que desativei a conta "atendente"
    Quando reativo a conta "atendente"
    Então o status da resposta deve ser 200
    Quando entro com o e-mail "atendente@oticaviser.com.br" e a senha "senha-da-atendente-123"
    Então o status da resposta deve ser 200

  Cenário: Atendente tenta desativar uma conta
    Dado que entrei como "atendente"
    Quando desativo a conta "administrador"
    Então o status da resposta deve ser 403

  Cenário: Administrador tenta desativar a própria conta
    Dado que entrei como "administrador"
    Quando desativo a conta "administrador"
    Então o status da resposta deve ser 409
    E a resposta deve dizer "não é possível desativar a própria conta"
