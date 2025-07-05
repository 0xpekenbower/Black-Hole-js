FROM node:23-slim

WORKDIR /dash

COPY package*.json ./
RUN npm install

# COPY . .

CMD ["npm", "run", "dev"]