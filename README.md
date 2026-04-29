# ConectaBem — Plataforma Gamificada de Doações e Economia Circular

O **ConectaBem** é uma plataforma fullstack desenvolvida para revolucionar o ecossistema de doações, conectando doadores a ONGs (Instituições) de forma transparente, gamificada e eficiente. Através do sistema, doadores ganham pontos por suas contribuições, que podem ser trocados por recompensas reais no marketplace.

---

## 🚀 Tecnologias Utilizadas

### Frontend
- **React.js**: Biblioteca principal para construção da interface.
- **Vite**: Ferramenta de build ultra-rápida.
- **Tailwind CSS**: Estilização baseada em utilitários para um design moderno e responsivo.
- **Lucide React**: Biblioteca de ícones premium.
- **Axios**: Cliente HTTP para comunicação com a API.
- **SweetAlert2**: Modais e alertas interativos.
- **React Router DOM**: Gerenciamento de rotas e proteção de acesso.

### Backend
- **Node.js & Express**: Ambiente de execução e framework para a API REST.
- **Prisma ORM**: Mapeamento objeto-relacional para interação com o banco de dados.
- **PostgreSQL**: Banco de dados relacional para persistência de dados.
- **JWT (JSON Web Token)**: Autenticação segura de usuários.
- **Bcrypt.js**: Criptografia de senhas para segurança máxima.

---

## 🏗️ Estrutura do Projeto

O projeto segue uma estrutura modular para facilitar a manutenção e escalabilidade:

### `/backend`
- `server.js`: Ponto de entrada da aplicação e registro de rotas.
- `/prisma`: Contém o `schema.prisma` (modelagem do banco) e scripts de `seed`.
- `/src/controllers`: Lógica de negócio (Processamento de doações, saques, resgates).
- `/src/routes`: Definição dos endpoints da API.
- `/src/middlewares`: Filtros de segurança (ex: validação de token e permissões de Admin/ONG).

### `/frontend`
- `/src/components`: Componentes reutilizáveis (Navbar, Cards, Modais).
- `/src/pages`: Telas da aplicação (Login, Cadastro, Dashboards).
- `/src/contexts`: Gerenciamento de estado global (Autenticação do usuário).
- `/src/services`: Configuração do Axios e integração com a API.

---

## 📊 Modelagem do Banco de Dados (Prisma)

A inteligência do sistema reside na estrutura relacional do banco:

1.  **User**: Define perfis de `DONOR`, `INSTITUTION` e `ADMIN`.
2.  **Donation**: Tabela central que registra:
    *   **Entradas**: Doações financeiras ou de itens (geram pontos para o doador).
    *   **Saídas**: Registros de Saque (Cashout) realizados pelas ONGs, identificados por valores negativos.
3.  **Reward**: Catálogo de itens disponíveis para troca (ex: Cupons Ifood, Netflix).
4.  **Redemption**: Vínculo entre doadores e os cupons que eles resgataram.

---

## 💡 Principais Funcionalidades

### 1. Painel do Doador
- **Histórico Dinâmico**: Visualização de todas as doações realizadas e status.
- **Sistema de Pontuação**: Acúmulo de pontos baseado no valor/item doado.
- **Níveis de Impacto**: Classificação em níveis (Bronze, Prata, Ouro) conforme engajamento.
- **Marketplace**: Troca de pontos por recompensas com geração de código de cupom em tempo real.

### 2. Painel da Instituição (ONG)
- **Gestão de Saldo**: Dashboard financeiro com cálculo automático de saldo disponível.
- **Saque via PIX**: Módulo de saque parcial ou total com máscaras dinâmicas de CPF/CNPJ/Telefone e validação de saldo.
- **Diferenciação de Fluxo**: Histórico financeiro que distingue visualmente o que é entrada de doação e o que é saída de saque.

### 3. Painel Administrativo
- **Visão Geral**: Métricas globais de impacto da plataforma.
- **Gerenciamento**: Controle de usuários, instituições e catálogo de recompensas.

---

## 🛠️ Como Executar o Projeto

1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/Lca2001C/Trabalho-A3.git
    ```

2.  **Backend**:
    ```bash
    cd backend
    npm install
    # Configure seu .env com DATABASE_URL e JWT_SECRET
    npx prisma migrate dev
    npm run dev
    ```

3.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

## 📄 Licença
Este projeto está sob a licença MIT. 

---
**ConectaBem** — *Transformando doações em impacto real.*
