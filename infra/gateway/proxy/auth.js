import { services } from '../config/index.js';

export async function registerAuthRoutes(gateway, fastifyHttpProxy) {
  await gateway.register(fastifyHttpProxy, {
    upstream: services.AUTH_SERVICE_URL,
    prefix: '/api/auth',
    rewritePrefix: '/api/auth',
  });

  await gateway.register(fastifyHttpProxy, {
    upstream: services.AUTH_SERVICE_URL,
    prefix: '/oauth',
    rewritePrefix: '/oauth',
  });

  await gateway.register(fastifyHttpProxy, {
    upstream: services.AUTH_SERVICE_URL,
    prefix: '/google',
    rewritePrefix: '/google',
  });

  await gateway.register(fastifyHttpProxy, {
    upstream: services.AUTH_SERVICE_URL,
    prefix: '/42',
    rewritePrefix: '/42',
  });
} 