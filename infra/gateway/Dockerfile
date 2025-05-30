FROM node:23-slim AS base
WORKDIR /gateway

COPY . .
USER node
CMD ["npm", "run", "dev"]