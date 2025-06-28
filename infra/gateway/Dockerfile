FROM node:23-slim

WORKDIR /gateway

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]