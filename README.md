# Delivery Backend (estilo iFood)

API REST em NestJS + Prisma + PostgreSQL para sistema de delivery com app do consumidor, app do entregador e portal de gerenciamento de loja.

## Pré-requisitos

- Node.js 18+
- PostgreSQL
- npm ou yarn

## Configuração

1. Clone o repositório e instale as dependências:

```bash
npm install
```

2. Crie um arquivo `.env` na raiz (use `.env.example` como base):

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/delivery_db"
JWT_SECRET="sua-chave-secreta-forte"
JWT_EXPIRES_IN="7d"
PORT=3000
```

3. Execute as migrations e o seed (categorias iniciais):

```bash
npx prisma migrate deploy
npx prisma db seed
```

4. Gere o cliente Prisma (já roda no `postinstall`):

```bash
npx prisma generate
```

## Desenvolvimento

```bash
npm run start:dev
```

A API estará em `http://localhost:3000`.

## Build e produção

```bash
npm run build
npm run start:prod
```

## Deploy no Railway

O projeto inclui `railway.toml` com os comandos de build e start. Use **yarn** (ou npm) conforme o lockfile.

1. Crie um projeto no [Railway](https://railway.app) e adicione um serviço **PostgreSQL**.
2. Adicione um serviço **Web** e conecte este repositório.
3. Defina as variáveis de ambiente no serviço da API:
   - `DATABASE_URL` – copie do serviço PostgreSQL (Connect / Variables).
   - `JWT_SECRET` – gere uma chave forte (ex.: `openssl rand -base64 32`).
   - `JWT_EXPIRES_IN` – ex.: `7d`.
   - `PORT` – normalmente injetado pelo Railway; se não estiver, use `3000`.
4. O build e o start vêm do `railway.toml`:
   - **Build:** `yarn install && npx prisma generate && npx prisma migrate deploy && yarn build`
   - **Start:** `yarn start:prod`
5. Após o primeiro deploy, rode o **seed** (massa de testes) uma vez:
   - No painel do Railway: no serviço da API, abra **Settings** → **Deploy** e use um comando one-off, ou
   - Com Railway CLI: `railway run yarn db:seed` (ou `npx prisma db seed`).
   - Isso cria usuários de teste, lojas, produtos e pedidos (senha de todos: `123456`; ver log do seed para e-mails).

## Endpoints principais

| Método | Rota | Descrição | Roles |
|--------|------|------------|--------|
| POST | `/auth/register` | Registrar usuário | Público |
| POST | `/auth/login` | Login | Público |
| GET | `/auth/me` | Usuário autenticado | Autenticado |
| GET | `/stores` | Listar lojas | Público |
| GET | `/stores/:slug` | Detalhe da loja + cardápio | Público |
| POST | `/stores` | Criar loja | STORE_OWNER |
| GET | `/orders` | Listar pedidos (por role) | Autenticado |
| POST | `/orders` | Criar pedido | CUSTOMER |
| PATCH | `/orders/:id/status` | Atualizar status | STORE_OWNER, DRIVER |
| GET | `/deliveries/available` | Entregas disponíveis | DRIVER |
| PATCH | `/deliveries/:id/accept` | Aceitar entrega | DRIVER |
| PATCH | `/deliveries/location` | Atualizar localização | DRIVER |

Documentação completa dos módulos: Auth, Users, Addresses, Stores, Products, Orders, Deliveries, Payments, Reviews.

## Estrutura

- `src/auth` – Autenticação JWT e guards por role
- `src/users` – Perfil do usuário
- `src/addresses` – Endereços do usuário
- `src/categories` – Categorias de lojas (leitura)
- `src/stores` – Lojas/restaurantes
- `src/products` – Produtos e categorias do cardápio
- `src/orders` – Pedidos
- `src/deliveries` – Entregas (entregador)
- `src/payments` – Pagamentos
- `src/reviews` – Avaliações
- `prisma/schema.prisma` – Modelagem do banco

## Licença

MIT
