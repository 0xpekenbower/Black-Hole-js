import { services } from '../config/index.js';

export async function registerGameRoutes(gateway, fastifyHttpProxy, proxyOptions = {}) {
  await gateway.register(fastifyHttpProxy, {
    upstream: services.GAME_SERVICE_URL,
    prefix: '/api/game',
    rewritePrefix: '/api/game',
    ...proxyOptions
  });
} 