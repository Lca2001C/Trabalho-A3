# 🐳 Guia de Comandos Docker — ConectaBem

Este guia contém os comandos essenciais para gerenciar o ambiente Docker deste projeto.

## 🚀 Comandos Principais

| Comando | Descrição |
| :--- | :--- |
| `docker-compose up --build` | Constrói as imagens e sobe todos os containers. |
| `docker-compose up -d` | Sobe os containers em segundo plano (libera o terminal). |
| `docker-compose stop` | Para os containers (sem removê-los). |
| `docker-compose down` | Para e **remove** os containers e redes criadas. |
| `docker-compose logs -f` | Visualiza os logs em tempo real (útil para debug). |

---

## 🛠️ Comandos de Banco de Dados (Prisma)

Sempre que você alterar o arquivo `schema.prisma` ou precisar resetar o banco:

```bash
# Sincronizar o banco com o schema (Criar tabelas)
docker exec -it conectabem-backend npx prisma db push

# Gerar o cliente do Prisma (após mudar o schema)
docker exec -it conectabem-backend npx prisma generate

# Criar/Resetar o usuário Administrador Master
docker exec -it conectabem-backend node prisma/seedAdmin.js
```

---

## 🔍 Verificação e Debug

```bash
# Ver quais containers estão rodando e suas portas
docker ps

# Ver todos os containers (incluindo os parados)
docker ps -a

# Reiniciar um serviço específico (ex: o frontend)
docker-compose restart frontend

# Acessar o terminal dentro do container do backend
docker exec -it conectabem-backend sh
```

---

## ⚠️ Dicas Úteis

1. **Erro de Porta Ocupada:** Se o Docker não subir porque a porta `3001` ou `5173` está ocupada, verifique se você não tem um processo `node` rodando fora do Docker no seu Windows.
2. **Limpando Tudo:** Se quiser deletar tudo (inclusive os dados do banco) para começar do zero:
   ```bash
   docker-compose down -v
   ```
3. **Comando Correto:** Lembre-se que é `docker-compose` (sem o "r" no final).
