Projeto

Sistema para a Ótica Viser, ótica de Lajeado (RS). O objetivo desta fase é levantar o problema real do cliente através de uma conversa estruturada, antes de escrever a v1 do PRD (entrega da aula 6).

Cliente: Ótica Viser

Integrantes :
Gabriel Kuhn,
Gabriel de França,
Lucca Rosa

Board
https://github.com/users/gabriel-kuhn20/projects/4/views/1

Conteúdo do repositório
docs/perguntas-cliente.md — perguntas ao cliente organizadas por bloco, com as três prioritárias marcadas, a hipótese do problema e a ideia de caminho.
docs/pauta-aula-5.md — pauta da conversa com o cliente na aula 5.

# Projeto Viser — Sistema de Pós Venda da Ótica

Sistema para a Ótica Viser (Lajeado, RS): acompanha o cliente depois da entrega do óculos,
gerando lembretes de contato aos 7 dias, 2 meses e 1 ano, e registrando cada interação.

**Integrantes:** Gabriel Kuhn, Gabriel de França, Lucca Rosa

**Board:** https://github.com/users/gabriel-kuhn20/projects/4/views/1

**Figma:** COLE_AQUI_O_LINK_DO_FIGMA

## Tecnologias

- Frontend: React + TypeScript + Vite + Bootstrap
- Backend: Node.js + Express + TypeScript (MVC simples)
- Banco: PostgreSQL 16 + Prisma
- Autenticação: JWT (8h) + bcrypt

## Pré-requisitos

- Node.js 20+ e npm
- Docker (para o PostgreSQL)

## Como rodar

```bash
# 1. clonar e instalar as dependências (monorepo com workspaces)
git clone <url-do-repositorio>
cd projectViser
npm install

# 2. variáveis de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. subir o banco
docker compose -f backend/docker-compose.yml up -d

# 4. criar as tabelas e os dados iniciais
npm run prisma:generate --workspace=backend
npm run prisma:migrate --workspace=backend
cd backend; npx prisma db seed; cd ..

# 5. rodar backend e frontend juntos
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3333/api

**Usuário de teste (criado pelo seed):** `admin@oticaviser.com.br` / `trocar123`

## Telas

| Rota | Descrição |
|---|---|
| `/login` | entrar no sistema |
| `/tags` | CRUD de tags |
| `/pessoas` | CRUD de pessoas |
| `/atendentes` | cadastrar novas contas de atendente |
| `/`, `/clientes`, `/painel` | em desenvolvimento |

Todas as rotas, exceto `/login`, exigem autenticação. O botão **Sair** fica no cabeçalho.

## Estrutura

```
backend/   API (rotas_api → controle_regras → Prisma)
frontend/  interface React
docs/      PRD, diagramas, arquitetura, pauta e perguntas ao cliente
scripts_sql/  modelo relacional em SQL (documentação; a fonte de verdade é o Prisma)
```

Detalhes em `docs/ARQUITETURA.md`.

## Padrão de código

Nomes em português. Pastas `minusculo_com_underscore` compostas, arquivos em PascalCase com duas
palavras, funções começando com verbo. Commits com `feat:`, `fix:`, `att:` ou `test:`.

## Documentação da fase de levantamento

- `docs/perguntas-cliente.md` — perguntas ao cliente, hipótese do problema e ideia de caminho
- `docs/pauta-aula-5.md` — pauta da conversa com o cliente
