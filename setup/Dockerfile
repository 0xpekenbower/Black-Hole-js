FROM node:23-slim

WORKDIR /setup

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "start"]