FROM node:23-slim

WORKDIR /auth

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "start"]