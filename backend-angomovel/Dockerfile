FROM node:20

# Pasta de trabalho dentro do Docker
WORKDIR /app

# Copiar os arquivos de pacotes
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar todo o código do back-end
COPY . .

# Rodar o projeto
CMD ["npm", "run", "start:dev"]