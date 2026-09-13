# Arquitetura de pastas — Sistema de Pós Venda da Ótica

Decisões confirmadas com você antes de montar isso: monorepo, TypeScript,
back-end em MVC simples (rotas → controllers → banco), PostgreSQL + Prisma.

## Visão geral

```
sistema-pos-venda-otica/
├── documentacao_projeto/   PRD, diagramas, esta explicação
├── backend/                back-end (Node + Express + TypeScript + Prisma)
└── frontend/               front-end (React + TypeScript + Vite)
```

`backend` e `frontend` usam esses nomes de propósito, mesmo sem seguir o
padrão "área_domínio": são os termos que qualquer pessoa reconhece de
cara ao abrir o repositório no GitHub, e é exatamente a divisão que você
pediu para deixar explícita. A regra de pasta composta da skill de
padronização vale a partir daqui pra dentro, onde cada pasta já
representa uma fatia real do sistema (rotas, controllers, componentes
etc.), não a raiz do monorepo.

## backend/src

```
config_servidor/        instância do Prisma e a fábrica do app Express
middlewares_seguranca/  autenticação (RNF03) e tratamento de erros
rotas_api/               um Rota*.ts por recurso (Cliente, Lembrete, ...)
controle_regras/         um Controle*.ts por recurso, com a regra de negócio
rotina_marcos/           o agendador do UC04, fora do ciclo de requisição HTTP
utilitarios_datas/       cálculo de quando um marco é atingido
validadores_entrada/     um Validador*.ts por recurso (zod)
tipos_compartilhados/    tipos usados em mais de um lugar
```

Cada par rota/controller cobre os casos de uso e RFs do PRD:

| Arquivo | Casos de uso | RFs |
|---|---|---|
| RotaAutenticacao / ControleAutenticacao | UC01 | RF01 |
| RotaAtendente / ControleAtendente | UC10 | RF10 |
| RotaCliente / ControleCliente | UC02, UC03 | RF02, RF09 |
| RotaLembrete / ControleLembrete | UC05, UC08, UC09 | RF04, RF07, RF08 |
| RotaInteracao / ControleInteracao | UC06, UC07 | RF05, RF06 |
| RotaPainel / ControlePainel | UC11 | RF11 |
| AgendadorMarcos | UC04 | RF03 |

Não existe uma camada `models/` separada: com Prisma, o `schema.prisma`
já é o modelo de dados (as sete entidades do glossário, ver
`diagrama-modelo-dados.png`), e os controllers chamam o `clientePrisma`
direto. Isso é o que "MVC simples" significa aqui — se um dia o projeto
crescer e quiser isolar consultas complexas do banco, dá pra abrir uma
camada `acesso_dados/` no meio sem precisar reescrever rotas nem
controllers.

## frontend/src

```
paginas_app/            uma Pagina*.tsx por tela (rota)
componentes_layout/     cabeçalho, menu, guarda de rota autenticada
componentes_lembretes/  específicos da tela de lembretes
componentes_clientes/   específicos da tela de clientes
componentes_interacoes/ específicos da tela de histórico/interação
componentes_compartilhados/  botão, campo de texto, etc. reaproveitáveis
servicos_api/           um Api*.ts por recurso, chamando o backend
contextos_autenticacao/ contexto React de sessão
hooks_dados/            hooks (ver exceção abaixo)
tipos_compartilhados/   espelham os tipos do back-end
utilitarios_formatacao/ formatação de data etc.
```

## Uma exceção deliberada à regra "tudo em português"

A skill `padronizacao-codigo-web` pede tudo em português, sem exceção
declarada. Só que hooks do React têm uma regra própria do framework: o
ESLint (`eslint-plugin-react-hooks`) e o próprio React reconhecem uma
função como hook procurando literalmente o prefixo `use` seguido de
maiúscula (`^use[A-Z]`). Se o arquivo/função virasse `usarAutenticacao`
sem o `use` em inglês na frente, as ferramentas de lint parariam de
aplicar as regras dos hooks (por exemplo, avisar quando uma condicional
chama um hook), o que é pior do que quebrar a convenção de nomes.

Por isso os hooks ficaram como `useAutenticacao.ts` (arquivo) exportando
`usarAutenticacao()` (nome da função, já em português) — o prefixo técnico
`use` é a única palavra em inglês em todo o projeto, e existe só pra não
desligar uma proteção do próprio React. Se preferir manter a regra sem
nenhuma exceção, dá pra abrir mão do lint de hooks e nomear os arquivos
inteiramente em português; é só avisar que eu ajusto.

## Como usar o scaffold

```bash
npm install
cp backend/.env.example backend/.env      # ajuste DATABASE_URL e JWT_SEGREDO
cp frontend/.env.example frontend/.env
npm run prisma:generate --workspace=backend
npm run prisma:migrate --workspace=backend      # cria as tabelas no Postgres
npm run dev
```

Os arquivos já têm nomes, assinaturas e comentários com o RF/UC que cada
um implementa, mas a lógica interna está só esboçada (o suficiente pra
compilar e servir de ponto de partida) — não é a implementação final das
regras de negócio.
