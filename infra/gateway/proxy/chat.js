import { services } from '../config/index.js';

export async function registerChatRoutes(gateway, fastifyHttpProxy, proxyOptions = {}) {
  await gateway.register(fastifyHttpProxy, {
    upstream: services.CHAT_SERVICE_URL,
    prefix: '/api/chat',
    rewritePrefix: '/api/chat',
    ...proxyOptions
  });
} 