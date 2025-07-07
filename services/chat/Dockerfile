FROM node:23-slim

WORKDIR /chat

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "start"]