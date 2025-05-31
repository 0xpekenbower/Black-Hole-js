FROM node:23-slim AS base
WORKDIR /setup

COPY . .
USER node
CMD ["npm", "run", "elasticsearch"]