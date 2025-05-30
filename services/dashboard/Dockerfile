FROM node:23-slim AS base
WORKDIR /dashboard

COPY . .
USER node
CMD ["npm", "run", "dev"]