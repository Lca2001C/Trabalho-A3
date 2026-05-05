# 🚀 Guia de Implantação em Ambiente de Produção — ConectaBem

Este guia descreve os passos necessários para implantar o **ConectaBem** em um ambiente de produção (Heroku, Vercel, Railway, AWS, etc.), garantindo segurança, performance e estabilidade.

---

## 🏗️ Arquitetura Recomendada

Para produção, recomendamos a separação dos serviços:
1.  **Frontend:** Hospedado em plataformas de Edge Computing (Vercel, Netlify) para baixa latência.
2.  **Backend:** Hospedado em instâncias Node.js estáveis (Railway, Render, AWS EC2).
3.  **Banco de Dados:** Instância PostgreSQL gerenciada (Supabase, ElephantSQL, AWS RDS).

---

## 🔐 Variáveis de Ambiente (Crucial)

Nunca compartilhe seu arquivo `.env`. Em produção, configure estas variáveis diretamente no painel da sua plataforma de hospedagem.

### Backend
| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | String de conexão segura do Postgres | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Chave aleatória longa e complexa | `openssl rand -base64 32` |
| `PORT` | Porta onde o servidor Express rodará | `3001` |
| `NODE_ENV` | Define o modo de execução | `production` |

### Frontend
| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL completa da sua API backend | `https://api.conectabem.com` |

---

## 🛠️ Passo a Passo da Implantação

### 1. Preparação do Banco de Dados
Certifique-se de que o banco de dados está acessível e execute as migrações:
```bash
# Dentro da pasta /backend
npx prisma migrate deploy
```
> **Nota:** Use `migrate deploy` em vez de `db push` em produção para manter o histórico de migrações e evitar perda de dados acidental.

### 2. Implantação do Backend
1.  Configure as variáveis de ambiente acima.
2.  Defina o script de inicialização como `npm start`.
3.  Garanta que o build do Prisma seja gerado durante a instalação:
```json
"scripts": {
  "postinstall": "prisma generate",
  "start": "node src/server.js"
}
```

### 3. Implantação do Frontend
1.  Configure a variável `VITE_API_URL`.
2.  O build gerará arquivos estáticos na pasta `dist/`.
3.  Certifique-se de configurar o roteamento (fallback para `index.html`) se usar Vercel/Netlify.

---

## 🛡️ Checklist de Segurança

- [ ] **SSL/HTTPS:** Obrigatório em todas as comunicações.
- [ ] **JWT_SECRET:** Alterado para uma chave única e secreta de produção.
- [ ] **CORS:** Configurado para aceitar apenas o domínio do seu frontend.
- [ ] **Rate Limiting:** Recomendado adicionar middleware para prevenir ataques de força bruta.
- [ ] **Logs:** Utilize um serviço de logs (Sentry, LogDNA) para monitorar erros em tempo real.

---

## 📈 Monitoramento e Manutenção

- **Backups:** Configure backups automáticos no seu provedor de banco de dados.
- **Health Checks:** Adicione uma rota `GET /health` na API para monitorar a disponibilidade.
- **CI/CD:** Utilize GitHub Actions para automatizar os testes e o deploy ao fazer push na branch `main`.

---

<div align="center">
  <b>ConectaBem — Transformando tecnologia em impacto social.</b>
</div>
