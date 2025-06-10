import { services } from '../config/index.js';

export async function registerAuthRoutes(gateway, fastifyHttpProxy, proxyOptions = {}) {
  await gateway.register(fastifyHttpProxy, {
    upstream: services.AUTH_SERVICE_URL,
    prefix: '/api/auth',
    rewritePrefix: '/api/auth',
    ...proxyOptions
  });
} 