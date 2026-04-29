<div align="center">
   
  <h1>🌟 ConectaBem</h1>
  <p><b>Plataforma Gamificada de Doações e Economia Circular</b></p>
  
  <p>
    Transformando a solidariedade em uma experiência transparente, recompensadora e altamente engajadora. Conectamos doadores a ONGs com rastreabilidade real e um sistema de marketplace integrado.
  </p>
</div>

---

## 🚀 Visão Geral

O **ConectaBem** revoluciona o ecossistema de doações ao introduzir a **gamificação** no terceiro setor. 
A plataforma atua em duas frentes principais:
1. **Para os Doadores:** Transforma a boa ação em uma jornada. Cada doação (financeira ou de itens) gera pontos. O usuário sobe de nível (Bronze, Prata, Ouro) e pode trocar seus pontos por recompensas reais (Gift Cards) no Marketplace exclusivo.
2. **Para as ONGs:** Oferece um painel de gestão financeira robusto, listagem de inventário, criação de campanhas de necessidades e um módulo exclusivo de **Saque via PIX** com cálculo automático de saldo em tempo real.

---

## 💻 Tecnologias Utilizadas

O projeto foi construído utilizando as melhores práticas do mercado, dividindo a responsabilidade entre uma API RESTful de alta performance e uma Single Page Application (SPA) reativa e fluida.

### 🎨 Frontend (Client-side)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

*   **React.js + Vite:** Interface ultrarrápida, componentizada e com Hot Module Replacement (HMR) instantâneo.
*   **Tailwind CSS:** Estilização utilitária para garantir responsividade total e um design system limpo e consistente.
*   **Context API:** Gerenciamento de estado global centralizado para autenticação de usuários e papéis de acesso (`AuthContext`).
*   **Lucide React & SweetAlert2:** Iconografia moderna e feedbacks visuais elegantes e interativos.

### ⚙️ Backend (Server-side)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

*   **Node.js + Express:** Construção de rotas da API, middlewares de proteção de rotas privadas (RBAC - Role Based Access Control) e controladores lógicos.
*   **Prisma ORM:** Abstração do banco de dados, garantindo tipagem segura e migrações ágeis.
*   **PostgreSQL (Hospedado no Supabase):** Banco de dados relacional escolhido pela sua robustez na garantia de integridade das transações financeiras.
*   **Bcrypt.js + JWT:** Criptografia irreversível de senhas (usando salt e hash `$2b$12$`) e geração de tokens de sessão seguros.

---

## 🗄️ Modelagem e Arquitetura do Banco de Dados

A inteligência da aplicação reside no seu esquema relacional bem definido através do Prisma. O sistema gerencia saldos, transações e autenticação através de 5 tabelas principais no schema `public`:

| Tabela | Chaves e Campos Principais | Papel no Sistema e Relacionamentos |
| :--- | :--- | :--- |
| **`users`** | `id`, `nome`, `email`, `senha`, `role`, `pontos` | Coração do sistema de autenticação. Armazena a *Role* (`DONOR`, `INSTITUTION`, `ADMIN`), dados encriptados e o saldo em tempo real do doador. Possui relacionamento **1:N** com doações e resgates. |
| **`donations`** | `id`, `valor`, `tipo`, `userId`, `institutionId` | O motor financeiro. Registra doações positivas (entradas que geram pontos para o `USER`) e doações negativas (saídas de caixa/Saques PIX efetuados pela `INSTITUTION`). |
| **`requests`** | `id`, `name`, `qty`, `status`, `institutionId` | Campanhas de arrecadação criadas pelas ONGs (Ex: "Precisamos de agasalhos"). Relacionamento **N:1** com a tabela de ONGs (users). |
| **`rewards`** | `id`, `title`, `cost`, `stock` | O catálogo do Marketplace. Armazena os Gift Cards disponíveis, o custo em pontos e controla se o item está disponível no sistema. |
| **`redemptions`** | `id`, `code`, `userId`, `rewardId` | Tabela pivô de resgates. Quando um doador troca pontos, essa tabela une o `USER` à `REWARD`, gerando o código único do cupom e subtraindo os pontos. |

---

## 🏗️ Estrutura de Diretórios (Monorepo)

A arquitetura do projeto separa claramente as responsabilidades entre Front e Back, facilitando a escalabilidade:
```text
📦 Trabalho-A3 (ConectaBem)
 ┣ 📂 backend
 ┃ ┣ 📂 prisma          # Schema do banco de dados (schema.prisma)
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 controllers   # Lógica de negócio (Saques, Resgates, Dashboard KPIs)
 ┃ ┃ ┣ 📂 middlewares   # Filtros de Token JWT e Roles (isAdmin, isInstitution)
 ┃ ┃ ┗ 📂 routes        # Endpoints mapeados (auth.js, donations.js, admin.js)
 ┃ ┗ 📜 server.js       # Inicialização do Express e roteamento principal
 ┃
 ┣ 📂 frontend
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 components    # Dashboards isolados (Admin, ONG, Doador) e UI elements
 ┃ ┃ ┣ 📂 contexts      # AuthContext (Sessão global persistente)
 ┃ ┃ ┣ 📂 pages         # Layouts de página inteira protegidos pelo Router
 ┃ ┃ ┗ 📂 services      # Setup do Axios interceptors para requisições com Token
 ┃ ┗ 📜 vite.config.js  # Configuração de build do front
```

---

## ✨ Módulos e Funcionalidades

### 👤 1. Módulo do Doador (`/dashboard`)
*   **Wizard Interativo de Doações:** Fluxo passo a passo (formulário controlado) para doar itens físicos ou dinheiro, permitindo escolher a ONG de destino via combobox dinâmico.
*   **Gamificação:** Pontuação imediata e progressão visual de Níveis (Bronze, Prata, Ouro).
*   **Marketplace Real:** Resgate de cupons com validação de saldo no banco, desconto automático dos pontos e geração instantânea de código resgatável.

### 🏢 2. Módulo da Instituição (`/ong/dashboard`)
*   **KPIs Financeiros:** Cálculo do saldo atual em tempo real.
*   **Motor de Saque (Cashout):** Modal avançado para saque via PIX com máscara dinâmica no frontend (reconhece se a ONG digitou CPF, CNPJ, Email ou Telefone) e integração transacional no backend para abater o saldo.
*   **Recibos e Solicitações:** Emissão visual de comprovantes e criação de campanhas de necessidade que ficam visíveis para os doadores.

### 🛡️ 3. Módulo Administrativo (`/admin/dashboard`)
*   **Data Analytics:** Gráficos globais de evolução renderizados através da biblioteca Recharts.
*   **Paginação Server-Side:** Tabela global de doações com carregamento "Load More", lidando eficientemente com grandes volumes de dados.
*   **Gestão de Acessos:** Busca de usuários com "Debounce" e permissão de promover/rebaixar privilégios de Administrador em um clique.

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
*   [Node.js](https://nodejs.org/en/) (v18 ou superior)
*   [Git](https://git-scm.com/)
*   Conta no [Supabase](https://supabase.com/) ou PostgreSQL local.

### 1. Clonando o Repositório
```bash
git clone [https://github.com/Lca2001C/Trabalho-A3.git](https://github.com/Lca2001C/Trabalho-A3.git)
cd Trabalho-A3
```

### 2. Configurando a API (Backend)
Abra o terminal na pasta raiz e navegue para o backend:
```bash
cd backend

# Instale todas as dependências
npm install

# Crie um arquivo .env na raiz da pasta backend e adicione as chaves abaixo:
# DATABASE_URL="postgresql://usuario:senha@host:porta/banco?schema=public"
# JWT_SECRET="sua_chave_secreta_aqui_bem_forte"

# Aplique o schema no banco de dados (Criação de tabelas)
npx prisma db push

# Inicie o servidor em modo de desenvolvimento
npm run dev
```

### 3. Configurando a Aplicação (Frontend)
Abra uma segunda aba do terminal na pasta raiz e navegue para o frontend:
```bash
cd frontend

# Instale as dependências
npm install

# Inicie a aplicação com o Vite
npm run dev
```

A interface estará disponível em `http://localhost:5173/` e se comunicará com a API rodando em `http://localhost:3000/`.

---

## 🤝 Contribuição e Propósito

Este repositório é fruto do **Trabalho A3**, desenvolvido com foco em aplicar tecnologias de ponta em um problema real do terceiro setor: engajamento de doadores através de recompensas palpáveis e ferramentas administrativas sólidas para ONGs.

## 📄 Licença
Distribuído sob a licença **MIT**. Sinta-se à vontade para clonar, estudar e utilizar este projeto como base para as suas ideias.

---
<div align="center">
  <b>Feito com 💻 e foco no impacto positivo.</b>
</div>
