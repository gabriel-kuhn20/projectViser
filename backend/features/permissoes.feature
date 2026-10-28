# language: pt
Funcionalidade: Permissões por papel
  A atendente cuida do dia a dia; excluir cliente e gerenciar tags é só do administrador (RF11, RNF06).
  Esconder o botão na tela não basta: o servidor confere o papel em toda requisição.

  Cenário: Atendente tenta excluir uma cliente
    Dado que entrei como "atendente"
    E que a cliente "Fernanda Moura" está cadastrada
    Quando tento excluir a cliente "Fernanda Moura"
    Então o status da resposta deve ser 403
    E a resposta deve dizer "você não tem permissão para esta ação"

  Cenário: Administrador exclui uma cliente
    Dado que entrei como "administrador"
    E que a cliente "Fernanda Moura" está cadastrada
    Quando tento excluir a cliente "Fernanda Moura"
    Então o status da resposta deve ser 200

  Cenário: Atendente tenta criar uma tag
    Dado que entrei como "atendente"
    Quando cadastro a tag "Cliente VIP"
    Então o status da resposta deve ser 403
