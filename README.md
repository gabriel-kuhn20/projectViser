# Projeto Viser — Sistema de Pós Venda da Ótica

Sistema para a Ótica Viser (Lajeado, RS): acompanha a cliente depois da entrega dos óculos,
gerando lembretes de contato nos marcos definidos pelo administrador (por padrão 7 dias,
2 meses e 1 ano) e registrando cada interação no histórico.

Na rotina da equipe, a atendente:

- escolhe, em cada compra, quais marcos ela recebe (ex.: óculos de sol só com o de 7 dias);
- vê os lembretes pendentes por marco e quem espera há mais tempo;
- assume um lembrete ("em atendimento") para que ninguém ligue duas vezes para a mesma cliente;
- registra várias tentativas de contato antes de concluir o lembrete;
- registra contato antecipado quando a cliente liga ou passa na loja antes do marco vencer;
- consulta o histórico completo de contatos de cada cliente.

O repositório também contém o site institucional da Viser (páginas públicas).

**Integrantes:** Gabriel Kuhn, Gabriel de França, Lucca Rosa

**Sistema publicado:** http://177.44.248.93 (como está montado em [Publicação](#publicação))

**Protótipo no Figma (RNF08):** [abrir protótipo](https://www.figma.com/proto/thC593wExmreqhq6BsESLs/Viser?node-id=616-58&t=8oGcCptPvEi6F3vF-0&scaling=scale-down&content-scaling=fixed&page-id=615%3A57)

**Board:** https://github.com/users/gabriel-kuhn20/projects/6

## Tecnologias

- **Frontend:** React + TypeScript + Vite, React Router 6, axios, Tailwind CSS 3
- **Backend:** Node.js + Express + TypeScript (MVC simples), validação com zod, helmet e CORS restrito em produção
- **Banco:** PostgreSQL 16 (Docker) + Prisma. A busca de clientes sem diferenciar acento usa a extensão `unaccent`, criada pelas migrations
- **Autenticação:** JWT (8h) + bcrypt, com papéis `admin` e `atendente` conferidos no banco a cada requisição
  - o logout derruba o token no servidor, e trocar a senha derruba as outras sessões da conta
  - uma conta pode ser desativada sem perder o histórico de contatos
  - limite de 10 tentativas de login por IP a cada 15 minutos
- **Recuperação de senha:** link enviado por e-mail (Resend), válido por 30 minutos e de uso único; o banco guarda só o hash do token
- **Rotinas agendadas (node-cron):** geração dos lembretes dos marcos a cada hora e limpeza de tokens vencidos às 03:30
- **Testes:** Cucumber (BDD, cenários em português)

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
# em backend/.env ajuste ao menos DATABASE_URL, JWT_SEGREDO e URL_FRONTEND.
# Sem RESEND_API_KEY e EMAIL_REMETENTE, o e-mail de recuperação de senha é impresso no console.
# Em produção (NODE_ENV=production) é obrigatório definir ORIGEM_FRONTEND (CORS).

# 3. subir o banco
docker compose -f backend/docker-compose.yml up -d

# 4. criar as tabelas e os dados iniciais (marcos padrão e conta admin)
npm run prisma:generate --workspace=backend
npm run prisma:migrate --workspace=backend
cd backend; npx prisma db seed; cd ..

# (opcional) dados fictícios para demonstração: 50 clientes, compras, lembretes e histórico
cd backend; npx ts-node prisma/seed_demonstracao.ts; cd ..

# 5. rodar backend e frontend juntos
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3333/api

**Usuário de teste (criado pelo seed):** `admin@oticaviser.com.br` / `trocar123` (papel admin).
Troque a senha após o primeiro login. Em produção, defina `SEED_ATENDENTE_EMAIL` e
`SEED_ATENDENTE_SENHA` antes de rodar o seed.

## Testes

Cenários BDD em `backend/features/`:

- login, encerramento de sessão e limpeza de tokens;
- recuperação e troca de senha;
- contas (desativar/reativar e e-mail sem diferenciar maiúsculas);
- permissões por papel;
- cadastro de cliente e validação da data de entrega;
- lembretes e rotina de marcos (sem duplicar lembrete);
- conclusão de contato e lembrete "em atendimento";
- tags sem nome repetido.

Eles sobem a API de verdade contra um schema separado (`teste_bdd`) no mesmo PostgreSQL, sem mocks,
e apagam esse schema no fim. Com o banco no ar:

```bash
cd backend
npm run test:bdd
```

## Publicação

O sistema roda num servidor Ubuntu. Lá não tem Docker: o PostgreSQL está instalado direto no sistema.

| Peça | Onde |
|---|---|
| Acesso | SSH no servidor (usuário e senha ficam com o grupo, fora do repositório) |
| Código | `~/projectViser`, clone deste repositório na branch `main` |
| Backend | PM2, processo `viser-backend`, roda `backend/dist/index.js` na porta 3333 |
| Frontend | build copiado para `/var/www/viser` e servido pelo Nginx na porta 80 |
| Banco | PostgreSQL local, banco `pos_venda_otica` |
| Configuração | `backend/.env` e `frontend/.env` (com `VITE_URL_API=/api`), só no servidor, nunca no git |

O Nginx atende tudo na porta 80: entrega os arquivos de `/var/www/viser` e repassa `/api/` para o
backend em `127.0.0.1:3333`. As rotas do React (`/painel`, `/lembretes`...) caem no `index.html`.
O `index.html` vai sem cache e os arquivos de `/assets/` com cache longo (o nome deles muda a cada
build), então depois de uma atualização todo mundo recebe a versão nova sem limpar o navegador.

A configuração fica em `/etc/nginx/sites-enabled/` (cópia em `~/viser.nginx.bak`):

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/viser;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3333;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Atualizar depois de um merge na main

```bash
# 1. entrar no servidor
ssh <usuário>@177.44.248.93

# 2. baixar o código novo e instalar as dependências
cd ~/projectViser
git pull
npm ci

# 3. backend: Prisma Client, migrations novas, build e reinício
cd backend
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart viser-backend

# 4. frontend: build e cópia para a pasta que o Nginx serve
cd ../frontend
npm run build
sudo cp -r dist/. /var/www/viser/
```

- No servidor é sempre `migrate deploy`, nunca `migrate dev`: o `deploy` só aplica as migrations
  que já estão no repositório e não apaga dados.
- Sem o passo 4 o site continua na versão antiga: o Nginx serve `/var/www/viser`, não `frontend/dist`.

Para conferir:

```bash
pm2 ls                              # viser-backend com status online
pm2 logs viser-backend --lines 30   # sem erro na subida
curl -I http://localhost            # HTTP/1.1 200 OK
```

Se a versão nova der problema, volte o código para o commit anterior e refaça os passos 3 e 4:

```bash
cd ~/projectViser
git log --oneline -5         # anote o commit anterior ao merge
git checkout <commit>        # depois refaça os passos 3 e 4
git switch main              # quando a correção chegar na main, volte e atualize de novo
```

### Montar um servidor novo

Para quando o sistema mudar de servidor:

```bash
# 1. programas: Node.js 20+, PostgreSQL, Nginx e PM2
sudo apt install -y postgresql nginx git
sudo npm install -g pm2

# 2. banco e usuário (troque a senha)
sudo -u postgres psql -c "CREATE USER viser WITH PASSWORD 'troque_esta_senha';"
sudo -u postgres createdb -O viser pos_venda_otica

# 3. código e configuração
git clone https://github.com/gabriel-kuhn20/projectViser.git
cd projectViser
npm ci
cp backend/.env.example backend/.env
echo "VITE_URL_API=/api" > frontend/.env
# em backend/.env: DATABASE_URL com o usuário do passo 2, JWT_SEGREDO longo, NODE_ENV=production,
# URL_FRONTEND e ORIGEM_FRONTEND com o endereço público, RESEND_API_KEY e EMAIL_REMETENTE

# 4. backend: tabelas, dados iniciais e PM2 subindo junto com a máquina
cd backend
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run build
pm2 start dist/index.js --name viser-backend
pm2 save
pm2 startup   # rode o comando que ele imprimir

# 5. frontend
cd ../frontend
npm run build
sudo mkdir -p /var/www/viser
sudo cp -r dist/. /var/www/viser/

# 6. Nginx: salve a configuração acima em /etc/nginx/sites-available/viser
sudo ln -s /etc/nginx/sites-available/viser /etc/nginx/sites-enabled/viser
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## Telas

**Site institucional (público)**

| Rota | Descrição |
|---|---|
| `/` | início |
| `/quem-somos` | história da ótica e lojas |
| `/visagismo` | visagismo óptico |
| `/tendencias` | tendências de armações |

**Sistema (equipe)**

| Rota | Descrição | Acesso |
|---|---|---|
| `/login` | entrar no sistema | público |
| `/recuperar-senha` | pedir o link de redefinição por e-mail | público |
| `/redefinir-senha` | criar senha nova pelo link recebido | público |
| `/painel` | meus atendimentos, próximo cliente, pendências por marco e contatos registrados | todos |
| `/lembretes` | lembretes pendentes por marco (abas), com busca e filtro por tag | todos |
| `/clientes` | lista com busca e paginação no servidor, e filtro por tag | todos |
| `/clientes/novo` | cadastro de cliente com a primeira entrega | todos |
| `/historico/:clienteId` | dados, entregas, tags e histórico de contatos da cliente | todos |
| `/minha-conta` | trocar a própria senha | todos |
| `/atendentes` | contas da equipe: papéis, desativar/reativar, enviar link de senha e excluir | admin |
| `/tags` | CRUD de tags | admin |
| `/marcos` | CRUD dos marcos de acompanhamento | admin |

A atendente cuida do dia a dia. Excluir cliente e gerenciar atendentes, tags e marcos é só do
administrador, assim como reabrir um lembrete concluído e excluir compras que já têm contato
registrado. O servidor confere o papel em toda requisição, não só a tela.

## Estrutura

```
backend/      API (rotas_api → controle_regras → Prisma), rotinas agendadas (marcos e limpeza de tokens),
              regras de senha e sessão, envio de e-mail e testes BDD (features/)
frontend/     site institucional e interface do sistema em React
docs/         PRD, diagramas, arquitetura, pauta e perguntas ao cliente
scripts_sql/  modelo relacional em SQL, só como documentação (a fonte de verdade é o
              backend/prisma/schema.prisma)
```

Detalhes em `docs/ARQUITETURA.md`.

## Padrão de código

Nomes em português. Pastas `minusculo_com_underscore` compostas, arquivos em PascalCase com duas
palavras, funções começando com verbo. Commits com `feat:`, `fix:`, `att:` ou `test:`.

## Documentação

- `docs/PRD v3.1.pdf` — requisitos, casos de uso e decisões de implementação (versão atual; as anteriores ficam na mesma pasta)
- [Protótipo no Figma](https://www.figma.com/proto/thC593wExmreqhq6BsESLs/Viser?node-id=616-58&t=8oGcCptPvEi6F3vF-0&scaling=scale-down&content-scaling=fixed&page-id=615%3A57) — design aprovado das telas e do site (RNF08)
- `docs/modelo de dados.png` e `docs/diagrama de uso - ótica.png` — diagramas
- `docs/perguntas-cliente.md` — perguntas ao cliente, hipótese do problema e ideia de caminho
- `docs/pauta-aula-5.md` — pauta da conversa com o cliente
