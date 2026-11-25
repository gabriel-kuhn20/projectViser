# language: pt
Funcionalidade: Tags sem nome repetido
  O filtro da lista de clientes junta as tags pelo nome: "Prime" e "prime"
  seriam a mesma tag duas vezes, cada uma com uma parte dos clientes.

  Cenário: Cadastrar tag que já existe com outra caixa
    Dado que entrei como "administrador"
    E que a tag "Prime" está cadastrada
    Quando cadastro a tag "prime"
    Então o status da resposta deve ser 409
    E a resposta deve dizer "já existe uma tag com esse nome"

  Cenário: Renomear tag para um nome que já existe com outra caixa
    Dado que entrei como "administrador"
    E que a tag "Prime" está cadastrada
    E que a tag "Cliente VIP" está cadastrada
    Quando renomeio a tag "Cliente VIP" para "prime"
    Então o status da resposta deve ser 409
    E a resposta deve dizer "já existe uma tag com esse nome"

  Cenário: Corrigir só a caixa do nome da própria tag
    Dado que entrei como "administrador"
    E que a tag "prime" está cadastrada
    Quando renomeio a tag "prime" para "Prime"
    Então o status da resposta deve ser 200
