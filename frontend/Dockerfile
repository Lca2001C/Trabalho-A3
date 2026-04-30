# Estágio de desenvolvimento
FROM node:20-alpine

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta do Vite
EXPOSE 5173

# Comando para iniciar o Vite com --host para permitir acesso externo ao container
CMD ["npm", "run", "dev", "--", "--host"]
