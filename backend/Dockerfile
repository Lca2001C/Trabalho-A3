# Estágio de construção e execução
FROM node:20-alpine

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências
RUN npm install

# Copia o restante do código
COPY . .

# Gera o cliente do Prisma
RUN npx prisma generate

# Expõe a porta do backend
EXPOSE 3001

# Comando para iniciar (usando node server.js conforme o package.json)
CMD ["npm", "run", "dev"]
