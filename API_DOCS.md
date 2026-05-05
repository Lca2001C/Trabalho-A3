# 📖 Documentação da API — ConectaBem

Esta documentação descreve os principais endpoints da API RESTful do ConectaBem, os formatos de requisição e as respostas esperadas.

---

## 🔐 Autenticação
A maioria dos endpoints exige autenticação via **JWT (JSON Web Token)**.
Envie o token no cabeçalho de todas as requisições protegidas:
`Authorization: Bearer <seu_token>`

---

## 👤 Autenticação e Usuários
### Registro
- **POST** `/api/auth/register`
- **Body:** `{ "nome", "email", "senha", "role", "cnpj" (opcional), ... }`
- **Resposta:** `201 Created` com token e dados do usuário.

### Login
- **POST** `/api/auth/login`
- **Body:** `{ "email", "senha" }`
- **Resposta:** `200 OK` com token.

### Me (Perfil atual)
- **GET** `/api/auth/me` (Protegido)
- **Resposta:** Dados do usuário logado.

---

## 🎁 Doações
### Criar Doação
- **POST** `/api/donations` (Protegido - USER)
- **Body:** `{ "tipo": "item" | "financeira", "valor" (se financeira), "item" (se item), "institutionId" }`
- **Resposta:** `201 Created`.

### Listar Minhas Doações
- **GET** `/api/donations` (Protegido - USER)
- **Resposta:** Lista de doações do usuário.

### Confirmar Recebimento
- **POST** `/api/donations/:id/confirm` (Protegido - INSTITUTION)
- **Resposta:** `200 OK`.

---

## 🏢 Administrativo
### Estatísticas Globais
- **GET** `/api/admin/stats` (Protegido - ADMIN)
- **Resposta:** KPIs e dados para gráficos.

### Gerenciar Instituições
- **POST** `/api/admin/institutions/:id/approve` (Protegido - ADMIN)
- **POST** `/api/admin/institutions/:id/reject` (Protegido - ADMIN)

---

## 🛒 Marketplace e Recompensas
### Listar Recompensas
- **GET** `/api/rewards`
- **Resposta:** Lista de produtos disponíveis.

### Resgatar Recompensa
- **POST** `/api/rewards/redeem` (Protegido - USER)
- **Body:** `{ "rewardId" }`
- **Resposta:** `200 OK` com o código do cupom.

---

## 📊 Ranking
### Ver Ranking
- **GET** `/api/rewards/ranking?period=all|monthly|weekly`
- **Resposta:** Top 10 doadores e posição do usuário.

---

## 💰 Financeiro (ONG)
### Ver Saldo e Histórico
- **GET** `/api/donations/institution/finance` (Protegido - INSTITUTION)
- **Resposta:** Saldo atual e lista de entradas/saídas.

### Realizar Saque
- **POST** `/api/finance/withdraw` (Protegido - INSTITUTION)
- **Body:** `{ "pixKey", "pixType", "amount" }`
- **Resposta:** `200 OK`.

---

<div align="center">
  <b>ConectaBem — API v1.0.0</b>
</div>
