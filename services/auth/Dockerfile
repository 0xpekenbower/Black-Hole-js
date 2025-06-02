FROM node:23-slim AS base
WORKDIR /auth

COPY . .
RUN npm install
USER node
CMD ["npm", "run", "start"]