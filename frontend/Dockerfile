FROM node:23-slim AS base
WORKDIR /app

FROM base AS dev
COPY . .
USER node
CMD ["npm", "run", "dev"]