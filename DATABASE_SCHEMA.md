# 🗄️ Modelo de Dados — ConectaBem

O ConectaBem utiliza um banco de dados relacional (PostgreSQL) gerenciado pelo Prisma ORM. Abaixo está a representação visual e técnica do esquema.

---

## 📊 Diagrama de Entidade-Relacionamento (ER)

```mermaid
erDiagram
    User ||--o{ Donation : "realiza / recebe"
    User ||--o{ Redemption : "resgata"
    User ||--o{ Request : "solicita"
    Reward ||--o{ Redemption : "contida em"

    User {
        int id PK
        string nome
        string email UK
        string senha
        string role "ADMIN | USER | INSTITUTION"
        string status "PENDING | APPROVED | REJECTED"
        int pontos
        string cnpj
        string telefone
        string endereco
    }

    Donation {
        int id PK
        int userId FK
        int institutionId FK
        string tipo "item | financeira"
        string item
        float valor
        string status "pendente | aprovada | entregue"
        int pontosGerados
        datetime criadoEm
    }

    Request {
        int id PK
        int institutionId FK
        string name
        int qty
        string urgency
        string status "Aberto | Atendido"
        datetime criadoEm
    }

    Reward {
        int id PK
        string nome
        string descricao
        int custoPontos
        string tipo
        int estoque
        float preco
        boolean ativo
    }

    Redemption {
        int id PK
        int userId FK
        int rewardId FK
        string codigo
        int pontosDeduzidos
        datetime criadoEm
    }
```

---

## 📝 Descrição das Tabelas

### `users`
Armazena todos os perfis do sistema. A diferenciação de permissões é feita pelo campo `role`. O campo `pontos` é o saldo atual do doador.

### `donations`
Registra toda movimentação de entrada (doações) e saída (saques).
- Se `valor` > 0: É uma doação recebida.
- Se `valor` < 0: É um saque realizado pela ONG.

### `requests`
Lista de necessidades cadastradas pelas ONGs para sensibilizar doadores.

### `rewards`
Catálogo de itens (Gift Cards, vouchers) que podem ser trocados por pontos.

### `redemptions`
Histórico de trocas realizadas. Cada registro gera um código único que o usuário utiliza para resgatar sua recompensa.

---

<div align="center">
  <b>ConectaBem — Schema v1.2.0</b>
</div>
