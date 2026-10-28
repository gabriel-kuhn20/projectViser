# Projeto Viser — Sistema de Pós Venda da Ótica

Sistema para a Ótica Viser (Lajeado, RS): acompanha a cliente depois da entrega dos óculos,
gerando lembretes de contato nos marcos definidos pelo administrador (por padrão 7 dias,
2 meses e 1 ano) e registrando cada interação no histórico.

**Integrantes:** Gabriel Kuhn, Gabriel de França, Lucca Rosa

**Sistema publicado:** http://177.44.248.93

**Board:** https://github.com/users/gabriel-kuhn20/projects/4/views/1

## Tecnologias

- Frontend: React + TypeScript + Vite, React Router 6, axios, Tailwind CSS 3
- Backend: Node.js + Express + TypeScript (MVC simples), validação com zod
- Banco: PostgreSQL 16 (Docker) + Prisma
- Autenticação: JWT (8h) + bcrypt, com papéis `admin` e `atendente` conferidos no banco a cada requisição
- Rotina agendada: node-cron (gera os lembretes dos marcos a cada hora)
- Testes: Cucumber (BDD, cenários em português)

## Pré-requisitos

- Node.js 20+ e npm
- Docker (para o PostgreSQL)

## Como rodar

```bash
# 1. clonar e instalar as dependências (monorepo com workspaces)
git clone https://github.com/gabriel-kuhn20/projectViser.git
cd projectViser
npm install

# 2. variáveis de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. subir o banco
docker compose -f backend/docker-compose.yml up -d

# 4. criar as tabelas e os dados iniciais (marcos padrão e conta admin)
npm run prisma:generate --workspace=backend
npm run prisma:migrate --workspace=backend
cd backend; npx prisma db seed; cd ..

# 5. rodar backend e frontend juntos
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3333/api

**Usuário de teste (criado pelo seed):** `admin@oticaviser.com.br` / `trocar123` (papel admin)

## Testes

Cenários BDD em `backend/features/` (login, cadastro de cliente, lembretes e permissões por papel).
Eles sobem a API de verdade contra um schema separado (`teste_bdd`) no mesmo PostgreSQL, sem mocks,
e apagam esse schema no fim. Com o banco no ar:

```bash
cd backend
npm run test:bdd
```

## Telas

**Site institucional (público)**

| Rota | Descrição |
|---|---|
| `/` | início |
| `/quem-somos` | história da ótica e lojas |
| `/visagismo` | visagismo óptico |
| `/tendencias` | tendências de armações |

**Sistema (exige login)**

| Rota | Descrição | Papel |
|---|---|---|
| `/login` | entrar no sistema | — |
| `/painel` | meus atendimentos, próximo cliente e resumo dos marcos | todos |
| `/lembretes` | lembretes pendentes por marco (abas) | todos |
| `/clientes` | lista, busca e filtro por tag | todos |
| `/clientes/novo` | cadastro de cliente com a primeira entrega | todos |
| `/historico/:clienteId` | entregas e histórico de interações da cliente | todos |
| `/atendentes` | CRUD de contas e papéis | admin |
| `/tags` | CRUD de tags | admin |
| `/marcos` | CRUD dos marcos de acompanhamento | admin |

A atendente cuida do dia a dia; excluir cliente e gerenciar atendentes, tags e marcos é só do
administrador. O servidor confere o papel em toda requisição, não só a tela.

## Estrutura

```
backend/      API (rotas_api → controle_regras → Prisma), rotina dos marcos e testes BDD (features/)
frontend/     site institucional e interface do sistema em React
docs/         PRD, diagramas, arquitetura, pauta e perguntas ao cliente
scripts_sql/  modelo relacional em SQL (documentação; a fonte de verdade é o schema.prisma)
```

Detalhes em `docs/ARQUITETURA.md`.

## Padrão de código

Nomes em português. Pastas `minusculo_com_underscore` compostas, arquivos em PascalCase com duas
palavras, funções começando com verbo. Commits com `feat:`, `fix:`, `att:` ou `test:`.

## Documentação

- `docs/PRD v2.0.pdf` — requisitos, casos de uso e decisões de implementação
- `docs/modelo de dados.png` e `docs/diagrama de uso - ótica.png` — diagramas
- `docs/perguntas-cliente.md` — perguntas ao cliente, hipótese do problema e ideia de caminho
- `docs/pauta-aula-5.md` — pauta da conversa com o cliente
