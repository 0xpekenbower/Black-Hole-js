FROM node:23-slim

WORKDIR /game

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]